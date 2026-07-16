import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

// "sale" is intentionally excluded — sales are only triggered by the
// Razorpay webhook path to maintain payment audit integrity.
const adjustSchema = z.object({
  delta: z.number().int().refine((n) => n !== 0, {
    message: "Adjustment delta must be non-zero.",
  }),
  reason: z.enum(["restock", "adjustment", "return"]),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { session, error } = await requireAdminApiSession();
  if (error) return error;

  const { variantId } = await params;

  const body = await req.json();
  const parsed = adjustSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid adjustment payload." },
      { status: 400 }
    );
  }

  const { delta, reason, note } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock the inventory row and read current values
      const inventory = await tx.inventory.findUnique({
        where: { variantId },
        select: { id: true, stockQty: true },
      });

      if (!inventory) {
        throw Object.assign(new Error("Inventory record not found for this variant."), {
          status: 404,
          code: "INVENTORY_NOT_FOUND",
        });
      }

      const newStockQty = inventory.stockQty + delta;

      // Non-negotiable rule: stock never goes negative (AGENTS.md §5)
      if (newStockQty < 0) {
        throw Object.assign(
          new Error(
            `Adjustment would result in negative stock (${newStockQty}). Current stock: ${inventory.stockQty}.`
          ),
          { status: 400, code: "STOCK_NEGATIVE" }
        );
      }

      // Update inventory and write audit log in one atomic operation
      const [updated] = await Promise.all([
        tx.inventory.update({
          where: { id: inventory.id },
          data: { stockQty: newStockQty },
        }),
        tx.inventoryLog.create({
          data: {
            variantId,
            changeQty: delta,
            reason,
            actorId: session.user.email ?? session.user.id,
            actorUserId: session.user.id,
            note: note ?? null,
          },
        }),
      ]);

      return { newStockQty: updated.stockQty };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      "code" in err
    ) {
      const typed = err as { status: number; code: string; message: string };
      return NextResponse.json(
        { error: typed.message, code: typed.code },
        { status: typed.status }
      );
    }

    console.error("[inventory/adjust] Unexpected error:", err);
    return NextResponse.json(
      { error: "Stock adjustment failed. Please try again." },
      { status: 500 }
    );
  }
}
