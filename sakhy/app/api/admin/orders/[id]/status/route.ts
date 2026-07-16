import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().trim().max(120).optional(),
}).refine(
  (data) => data.status !== undefined || data.trackingNumber !== undefined,
  { message: "Provide at least one of: status, trackingNumber." }
);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id: orderId } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload." },
      { status: 400 }
    );
  }

  const { status: newStatus, trackingNumber } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Build update payload
    const updateData: Record<string, unknown> = {};

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber || null;
    }

    if (newStatus) {
      // No-op if status unchanged
      if (order.status === newStatus && trackingNumber === undefined) {
        return NextResponse.json({ order });
      }

      // ── Razorpay Automated Refund ──
      if (newStatus === "refunded") {
        const payment = order.payment;
        if (payment && payment.status === "captured" && payment.providerPaymentId) {
          if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json(
              { error: "Razorpay server keys not configured for refunds." },
              { status: 500 }
            );
          }

          const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          try {
            const refundResult = await rzp.payments.refund(payment.providerPaymentId, {
              amount: payment.amount,
              notes: {
                localOrderId: orderId,
                reason: "Admin forced full refund from UI",
              },
            });

            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.refunded,
                rawPayload: refundResult as unknown as any,
              },
            });
          } catch (rzpError: any) {
            console.error("Razorpay Refund Error", rzpError);
            return NextResponse.json(
              { error: rzpError?.error?.description || "Razorpay API rejected the refund." },
              { status: 400 }
            );
          }
        }
      }

      updateData.status = newStatus;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("[orders/status] Error:", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}