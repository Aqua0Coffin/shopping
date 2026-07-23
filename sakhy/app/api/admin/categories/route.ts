import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
});

export async function GET() {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid category payload." },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: parsed.data,
  });

  return NextResponse.json({ category }, { status: 201 });
}
