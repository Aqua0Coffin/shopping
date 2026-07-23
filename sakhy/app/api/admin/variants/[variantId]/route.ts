import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const updateVariantSchema = z.object({
  sku: z.string().trim().min(2).max(80).optional(),
  color: z.string().trim().min(2).max(80).optional(),
  blouseIncluded: z.boolean().optional(),
  borderType: z.string().trim().max(120).nullable().optional(),
  price: z.number().int().min(1).optional(),
  images: z.array(z.string().url()).max(12).optional(),
  weightGrams: z.number().int().positive().nullable().optional(),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ variantId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const [{ variantId }, body] = await Promise.all([
    context.params,
    req.json(),
  ]);
  const parsed = updateVariantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid variant payload." },
      { status: 400 }
    );
  }

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: parsed.data,
  });

  return NextResponse.json({ variant });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ variantId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { variantId } = await context.params;
  await prisma.productVariant.delete({ where: { id: variantId } });
  return NextResponse.json({ ok: true });
}
