import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export async function requireAdminApiSession() {
  const session = await requireAdminSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { session, error: null };
}
