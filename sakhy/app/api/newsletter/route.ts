import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per window

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit({
      key: `newsletter:${ip}`,
      limit: MAX_REQUESTS,
      windowMs: LIMIT_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please wait a minute." },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      );
    }

    const body = await req.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    
    // Log the subscription for developer audit (Resend integration happens in Phase 3/4)
    console.log(`[NEWSLETTER SUBSCRIBE] Email: ${email} registered from IP: ${ip}`);

    return NextResponse.json(
      { message: "Subscription successful." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter registration failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
