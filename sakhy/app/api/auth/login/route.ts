import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { z } from "zod";
import { verifyCredentials } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const COOKIE_NAME =
  process.env.NEXTAUTH_URL?.startsWith("https://")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  const user = await verifyCredentials(parsed.data, ip);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  // Build the JWT payload that NextAuth expects (same shape as the jwt() callback)
  const token = await encode({
    token: {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days, matches NextAuth default
  });

  const isSecure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecure,
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
