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

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          pincode: true,
          phone: true,
          isDefault: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  // Fetch orders separately with totals
  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { items: true } },
      payment: { select: { status: true, providerPaymentId: true } },
    },
  });

  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: id, status: { not: "cancelled" } },
    _sum: { total: true },
  });

  const totalSpent = orderAggs[0]?._sum.total || 0;

  return NextResponse.json({
    customer: {
      ...user,
      totalSpent,
      orders,
    },
  });
}