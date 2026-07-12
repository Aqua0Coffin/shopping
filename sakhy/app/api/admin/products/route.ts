import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).optional(),
  categoryId: z.string().min(1),
  fabricType: z.string().trim().min(2).max(120),
  occasion: z.string().trim().max(120).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  basePrice: z.number().int().min(1),
});

export async function GET() {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      variants: {
        select: {
          id: true,
          sku: true,
          color: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid product payload." },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: parsed.data,
  });

  return NextResponse.json({ product }, { status: 201 });
}
