import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/checkout";

function isAuthorized(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ...existing code below this stays exactly as it was
}


export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const released = await releaseExpiredReservations();

  return NextResponse.json({
    ok: true,
    released,
  });
}
