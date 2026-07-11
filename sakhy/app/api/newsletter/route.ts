import { NextResponse } from "next/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Simple in-memory rate limiting map (IP -> timestamps[])
const rateLimitMap = new Map<string, number[]>();
const LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per window

export async function POST(req: Request) {
  try {
    // Basic IP rate limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];

    // Filter out timestamps outside the limit window
    const activeTimestamps = timestamps.filter((t) => now - t < LIMIT_WINDOW_MS);
    
    if (activeTimestamps.length >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    // Add current timestamp and update map
    activeTimestamps.push(now);
    rateLimitMap.set(ip, activeTimestamps);

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
