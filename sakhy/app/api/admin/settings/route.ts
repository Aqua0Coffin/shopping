import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApiSession } from "@/lib/admin-api";

// Known setting keys — explicit allowlist prevents arbitrary key injection
export const KNOWN_SETTING_KEYS = [
  "hero_supertitle",
  "hero_headline",
  "hero_subheadline",
  "hero_cta_primary",
  "hero_cta_secondary",
  "shipping_flat_paise",
  "tax_rate_bps",
] as const;

type SettingKey = (typeof KNOWN_SETTING_KEYS)[number];

const putSchema = z.object({
  // All optional — only keys provided will be upserted
  hero_supertitle: z.string().trim().max(200).optional(),
  hero_headline: z.string().trim().max(200).optional(),
  hero_subheadline: z.string().trim().max(500).optional(),
  hero_cta_primary: z.string().trim().max(80).optional(),
  hero_cta_secondary: z.string().trim().max(80).optional(),
  shipping_flat_paise: z
    .number()
    .int()
    .min(0)
    .max(99_999_99) // ₹99,999 max shipping cap
    .optional(),
  tax_rate_bps: z
    .number()
    .int()
    .min(0)
    .max(10000) // 100% max
    .optional(),
});

export async function GET() {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [...KNOWN_SETTING_KEYS] } },
  });

  // Return as a keyed object for easy consumption
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<
    Record<SettingKey, string>
  >;

  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const { error } = await requireAdminApiSession();
  if (error) return error;

  const body = await req.json();
  const parsed = putSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload." },
      { status: 400 }
    );
  }

  // Upsert each provided key
  const upserts = Object.entries(parsed.data)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    );

  await Promise.all(upserts);

  return NextResponse.json({ ok: true });
}
