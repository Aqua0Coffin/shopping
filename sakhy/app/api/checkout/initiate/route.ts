import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CheckoutError,
  createCheckoutOrder,
} from "@/lib/checkout";
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const checkoutSchema = z.object({
  customer: z.object({
    email: z.string().email(),
    line1: z.string().trim().min(3).max(160),
    line2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
    phone: z.string().trim().regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number"),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(5),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit({
    key: `checkout:initiate:${ip}`,
    limit: 8,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a minute." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout details." },
        { status: 400 }
      );
    }

    const checkout = await createCheckoutOrder(parsed.data);

    return NextResponse.json(checkout, {
      status: 201,
      headers: rateLimitHeaders(rateLimit),
    });
  } catch (error) {
    console.error("Checkout initiation failed", error);

    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Checkout could not be started. Please try again." },
      { status: 500 }
    );
  }
}
