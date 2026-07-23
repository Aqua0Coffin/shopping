import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";
import { OrderStatus, PaymentStatus } from "@prisma/client";

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  trackingNumber: z.string().trim().max(120).nullable().optional(),
}).refine(
  (data) => data.status !== undefined || data.trackingNumber !== undefined,
  { message: "Provide at least one of: status, trackingNumber." }
).strict();

const FULFILLMENT_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
};

export async function PATCH(
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

    if (newStatus) {
      const allowedNextStatuses = FULFILLMENT_TRANSITIONS[order.status] || [];
      if (!allowedNextStatuses.includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot transition an order from "${order.status}" to "${newStatus}".` },
          { status: 400 }
        );
      }

      if (
        order.payment?.status !== PaymentStatus.captured ||
        !order.payment.signatureVerified
      ) {
        return NextResponse.json(
          { error: "Only verified, captured payments can enter fulfillment." },
          { status: 400 }
        );
      }
    }

    if (
      trackingNumber !== undefined &&
      newStatus !== OrderStatus.shipped &&
      order.status !== OrderStatus.shipped &&
      order.status !== OrderStatus.delivered
    ) {
      return NextResponse.json(
        { error: "A tracking reference can only be saved for shipped or delivered orders." },
        { status: 400 }
      );
    }

    const updateData = {
      ...(newStatus ? { status: newStatus } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber || null } : {}),
    };

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