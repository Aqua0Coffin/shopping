import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

const patchSchema = z.object({
  customerName: z.string().trim().min(1).max(120).optional(),
  quote: z.string().trim().min(1).max(2000).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  imageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });

  if (!testimonial) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ testimonial });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload." },
      { status: 400 }
    );
  }

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ testimonial });
  } catch {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
  }
}
