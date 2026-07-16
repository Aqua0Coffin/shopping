import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const querySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
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

  const { status, search, startDate, endDate, sort, page, limit } = parsed.data;

  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: sort === "newest" ? "desc" : "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true },
        },
        address: {
          select: { line1: true, city: true, state: true },
        },
        payment: {
          select: { status: true, providerPaymentId: true },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}