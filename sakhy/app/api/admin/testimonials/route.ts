import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const createSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  quote: z.string().trim().min(1).max(2000),
  location: z.string().trim().min(1).max(120),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ testimonials });
}

export async function POST(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload." },
      { status: 400 }
    );
  }

  const { imageUrl, ...rest } = parsed.data;

  const testimonial = await prisma.testimonial.create({
    data: {
      ...rest,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
