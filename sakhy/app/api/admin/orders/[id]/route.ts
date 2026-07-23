import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, createdAt: true },
      },
      address: true,
      items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              color: true,
              price: true,
              images: true,
              product: {
                select: { id: true, name: true, slug: true, fabricType: true },
              },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}