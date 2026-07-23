import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const { variantId } = await params;

  const logs = await prisma.inventoryLog.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      changeQty: true,
      reason: true,
      actorId: true,
      note: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ logs });
}
