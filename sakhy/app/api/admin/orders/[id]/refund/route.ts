import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const refundSchema = z.object({
  amount: z.number().int().min(1).optional(),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id: orderId } = await params;

  const body = await req.json();
  const parsed = refundSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid refund payload." },
      { status: 400 }
    );
  }

  const { amount, reason } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status !== "paid" && order.status !== "processing" && order.status !== "shipped") {
      return NextResponse.json(
        { error: `Cannot refund an order with status "${order.status}". Only paid/processing/shipped orders can be refunded.` },
        { status: 400 }
      );
    }

    const payment = order.payment;
    if (!payment || !payment.providerPaymentId) {
      return NextResponse.json(
        { error: "No Razorpay payment found for this order." },
        { status: 404 }
      );
    }

    if (payment.status === "refunded") {
      return NextResponse.json(
        { error: "This order has already been fully refunded." },
        { status: 400 }
      );
    }

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

    const refundAmount = amount || payment.amount;

    let refundResult;
    try {
      refundResult = await rzp.payments.refund(payment.providerPaymentId, {
        amount: refundAmount,
        notes: {
          localOrderId: orderId,
          reason: reason || "Admin-initiated refund from dashboard",
        },
      });
    } catch (rzpError: any) {
      console.error("Razorpay Refund API Error:", rzpError);
      return NextResponse.json(
        { error: rzpError?.error?.description || "Razorpay refund API rejected the request." },
        { status: 400 }
      );
    }

    // Update local records
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.refunded,
          rawPayload: refundResult as unknown as any,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.refunded },
      });
    });

    return NextResponse.json({
      ok: true,
      refund: refundResult,
      orderId,
      message: `Refund of ₹${(refundAmount / 100).toLocaleString("en-IN")} processed successfully.`,
    });
  } catch (err) {
    console.error("[orders/refund] Error:", err);
    return NextResponse.json(
      { error: "Refund processing failed unexpectedly." },
      { status: 500 }
    );
  }
}