import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

export async function GET() {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const variants = await prisma.productVariant.findMany({
    orderBy: [
      { product: { name: "asc" } },
      { sku: "asc" },
    ],
    select: {
      id: true,
      sku: true,
      color: true,
      product: {
        select: { id: true, name: true, status: true },
      },
      inventory: {
        select: {
          id: true,
          stockQty: true,
          reservedQty: true,
          lowStockThreshold: true,
          updatedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ variants });
}
