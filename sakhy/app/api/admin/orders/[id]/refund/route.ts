import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

const refundSchema = z.object({
  reason: z.string().trim().max(500).optional(),
}).strict();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id: orderId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
  const parsed = refundSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid refund payload." },
      { status: 400 }
    );
  }

  const { reason } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (!(["paid", "processing", "shipped", "delivered"] as OrderStatus[]).includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot refund an order with status "${order.status}". Only paid, processing, shipped, or delivered orders can be refunded.` },
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

    if (payment.status === PaymentStatus.refunded) {
      return NextResponse.json(
        { error: "This order has already been fully refunded." },
        { status: 400 }
      );
    }

    if (payment.status !== PaymentStatus.captured || !payment.signatureVerified) {
      return NextResponse.json(
        { error: "Only a verified, captured Razorpay payment can be refunded." },
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

    const refundAmount = payment.amount;

    let refundResult: {
      id?: string;
      entity?: string;
      status?: string;
      amount?: number;
      payment_id?: string;
    };
    try {
      refundResult = await rzp.payments.refund(payment.providerPaymentId, {
        amount: refundAmount,
        notes: {
          localOrderId: orderId,
          reason: reason || "Admin-initiated refund from dashboard",
        },
      });
    } catch (rzpError: unknown) {
      console.error("Razorpay Refund API Error:", rzpError);
      const apiError = rzpError as { error?: { description?: string } };
      return NextResponse.json(
        { error: apiError.error?.description || "Razorpay refund API rejected the request." },
        { status: 400 }
      );
    }

    // Update local records
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.refunded,
          rawPayload: refundResult as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.refunded },
      });
    });

    return NextResponse.json({
      ok: true,
      refund: {
        id: refundResult.id,
        entity: refundResult.entity,
        status: refundResult.status,
        amount: refundResult.amount,
        paymentId: refundResult.payment_id,
      },
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