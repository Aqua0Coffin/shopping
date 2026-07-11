import { NextResponse } from "next/server";
import {
  CheckoutError,
  processRazorpayWebhook,
  verifyRazorpayWebhookSignature,
} from "@/lib/checkout";
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit({
    key: `razorpay:webhook:${ip}`,
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many webhook requests." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const payload = JSON.parse(rawBody);
    const result = await processRazorpayWebhook(
      payload,
      rawBody,
      req.headers.get("x-razorpay-event-id")
    );

    return NextResponse.json(
      { ok: true, ...result },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid webhook JSON." },
        { status: 400 }
      );
    }

    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
