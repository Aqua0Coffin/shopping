import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  slug: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(3000).nullable().optional(),
  categoryId: z.string().min(1).optional(),
  fabricType: z.string().trim().min(2).max(120).optional(),
  occasion: z.string().trim().max(120).nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  basePrice: z.number().int().min(1).optional(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { productId } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { id: true, name: true } },
      variants: {
        include: {
          inventory: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { productId } = await context.params;
  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid product payload." },
      { status: 400 }
    );
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: parsed.data,
  });

  return NextResponse.json({ product });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { productId } = await context.params;
  await prisma.product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
