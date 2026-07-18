/**
 * Site settings helpers — server-side only.
 *
 * Shipping and tax defaults (used when no DB row exists yet):
 *   - shipping: ₹0 (free shipping by default until an admin sets a rate)
 *   - tax: 0 bps  (0% until set — GSTIN/GST-number handling is out of scope for v1)
 *
 * All monetary values are in paise (1 INR = 100 paise), matching Razorpay.
 * Tax rate is stored in basis points (100 bps = 1%).
 */

import { prisma } from "@/lib/prisma";

export const SETTINGS_DEFAULTS = {
  hero_supertitle: "Preserving Heritage, Weave by Weave",
  hero_headline: "Draped in Legacy & Grace",
  hero_subheadline:
    "Hand-woven masterpieces born from generational knowledge. Explore authentic silks crafted by India's finest weavers.",
  hero_cta_primary: "Explore Collections",
  hero_cta_secondary: "Our Heritage",
  shipping_flat_paise: "0",
  tax_rate_bps: "0",
} as const;

export type SettingKey = keyof typeof SETTINGS_DEFAULTS;

export async function getSiteSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.keys(SETTINGS_DEFAULTS) } },
  });

  const fromDb = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...SETTINGS_DEFAULTS, ...fromDb } as Record<SettingKey, string>;
}

/**
 * Calculates shipping (flat) and tax for a given subtotal in paise.
 * Both values returned in paise.
 */
export async function calculateOrderTotals(subtotalPaise: number): Promise<{
  shipping: number;
  tax: number;
  total: number;
}> {
  const settings = await getSiteSettings();

  const shippingFlat = parseInt(settings.shipping_flat_paise, 10) || 0;
  const taxRateBps = parseInt(settings.tax_rate_bps, 10) || 0;

  // Tax applied on subtotal only (not on shipping, as per typical Indian GST practice)
  const tax = Math.round((subtotalPaise * taxRateBps) / 10000);
  const total = subtotalPaise + shippingFlat + tax;

  return { shipping: shippingFlat, tax, total };
}
