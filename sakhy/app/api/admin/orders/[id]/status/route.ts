import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

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
    return NextResponse.json({ error: "Invalid status format." }, { status: 400 });
  }

  const { status: newStatus } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === newStatus) {
      return NextResponse.json({ order });
    }

    // 1. Razorpay Automatic Refund Handling
    if (newStatus === "refunded") {
      const payment = order.payment;
      // We only attempt an automated refund if the transaction was formally captured locally.
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
          // Fire API request to Razorpay to actually reverse the funds back to customer
          const refundResult = await rzp.payments.refund(payment.providerPaymentId, {
            amount: payment.amount, // Full refund in paise
            notes: {
              localOrderId: orderId,
              reason: "Admin forced full refund from UI",
            },
          });

          // Also update the Payment record alongside the Order record
          await prisma.payment.update({
            where: { id: payment.id },
            data: { 
              status: PaymentStatus.refunded,
              // Dump refund object into rawPayload or an updated schema field
              rawPayload: refundResult as unknown as any
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

    // 2. Standard Order Status Update
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("[orders/status] Error:", err);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
