import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const createVariantSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  color: z.string().trim().min(2).max(80),
  blouseIncluded: z.boolean().default(false),
  borderType: z.string().trim().max(120).nullable().optional(),
  price: z.number().int().min(1),
  images: z.array(z.string().url()).max(12).default([]),
  weightGrams: z.number().int().positive().nullable().optional(),
  stockQty: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).max(1000).default(5),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { error, session } = await requireAdminApiSession();
  if (error || !session) return error;

  const { productId } = await context.params;
  const body = await req.json();
  const parsed = createVariantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid variant payload." },
      { status: 400 }
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: {
        productId,
        sku: parsed.data.sku,
        color: parsed.data.color,
        blouseIncluded: parsed.data.blouseIncluded,
        borderType: parsed.data.borderType || null,
        price: parsed.data.price,
        images: parsed.data.images,
        weightGrams: parsed.data.weightGrams || null,
      },
    });

    await tx.inventory.create({
      data: {
        variantId: variant.id,
        stockQty: parsed.data.stockQty,
        reservedQty: 0,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
    });

    if (parsed.data.stockQty > 0) {
      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          changeQty: parsed.data.stockQty,
          reason: "restock",
          actorId: session.user.id,
          actorUserId: session.user.id,
          note: "Initial stock set from admin variant creation",
        },
      });
    }

    return variant;
  });

  return NextResponse.json({ variant: result }, { status: 201 });
}
