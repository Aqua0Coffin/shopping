import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit({
    key: `auth:signup:${ip}`,
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please wait a minute." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid signup details." },
      { status: 400, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "customer",
    },
  });

  return NextResponse.json(
    { ok: true },
    { status: 201, headers: rateLimitHeaders(rateLimit) }
  );
}
