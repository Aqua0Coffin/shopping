import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const querySchema = z.object({
  search: z.string().max(100).optional(),
  sort: z.enum(["newest", "oldest", "orders", "spent"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid query parameters." },
      { status: 400 }
    );
  }

  const { search, sort, page, limit } = parsed.data;

  const where: Prisma.UserWhereInput = { role: "customer" };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { id: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput[] =
    sort === "newest"
      ? [{ createdAt: "desc" }]
      : sort === "oldest"
        ? [{ createdAt: "asc" }]
        : [{ createdAt: "desc" }];

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Enrich with order totals
  const customerIds = customers.map((c) => c.id);
  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: customerIds }, status: { not: "cancelled" } },
    _sum: { total: true },
  });

  const aggMap = new Map(orderAggs.map((a) => [a.userId, a._sum.total || 0]));

  const enriched = customers.map((c) => ({
    id: c.id,
    email: c.email,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpent: aggMap.get(c.id) || 0,
  }));

  const totalSpentSort = sort === "spent" || sort === "orders"
    ? [...enriched].sort((a, b) => {
        if (sort === "spent") return b.totalSpent - a.totalSpent;
        return b.orderCount - a.orderCount;
      })
    : enriched;

  return NextResponse.json({
    customers: totalSpentSort,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}