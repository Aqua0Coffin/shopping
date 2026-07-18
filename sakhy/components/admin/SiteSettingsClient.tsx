"use client";

import { useState } from "react";

type SettingKey =
  | "hero_supertitle"
  | "hero_headline"
  | "hero_subheadline"
  | "hero_cta_primary"
  | "hero_cta_secondary"
  | "shipping_flat_paise"
  | "tax_rate_bps";

interface Props {
  initial: Partial<Record<SettingKey, string>>;
}

export default function SiteSettingsClient({ initial }: Props) {
  const [hero, setHero] = useState({
    hero_supertitle: initial.hero_supertitle ?? "",
    hero_headline: initial.hero_headline ?? "",
    hero_subheadline: initial.hero_subheadline ?? "",
    hero_cta_primary: initial.hero_cta_primary ?? "",
    hero_cta_secondary: initial.hero_cta_secondary ?? "",
  });

  const [shipping, setShipping] = useState({
    // Display as rupees (divide paise by 100), save back as paise
    shipping_flat_rupees: initial.shipping_flat_paise
      ? String(parseInt(initial.shipping_flat_paise) / 100)
      : "0",
    tax_rate_percent: initial.tax_rate_bps
      ? String(parseInt(initial.tax_rate_bps) / 100)
      : "0",
  });

  const [heroSaving, setHeroSaving] = useState(false);
  const [heroStatus, setHeroStatus] = useState<"idle" | "saved" | "error">("idle");
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingStatus, setShippingStatus] = useState<"idle" | "saved" | "error">("idle");

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroSaving(true);
    setHeroStatus("idle");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      setHeroStatus(res.ok ? "saved" : "error");
    } catch {
      setHeroStatus("error");
    } finally {
      setHeroSaving(false);
      setTimeout(() => setHeroStatus("idle"), 3000);
    }
  };

  const saveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingSaving(true);
    setShippingStatus("idle");

    const shippingPaise = Math.round(parseFloat(shipping.shipping_flat_rupees || "0") * 100);
    const taxBps = Math.round(parseFloat(shipping.tax_rate_percent || "0") * 100);

    if (isNaN(shippingPaise) || isNaN(taxBps) || shippingPaise < 0 || taxBps < 0 || taxBps > 10000) {
      setShippingStatus("error");
      setShippingSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping_flat_paise: shippingPaise,
          tax_rate_bps: taxBps,
        }),
      });
      setShippingStatus(res.ok ? "saved" : "error");
    } catch {
      setShippingStatus("error");
    } finally {
      setShippingSaving(false);
      setTimeout(() => setShippingStatus("idle"), 3000);
    }
  };

  const inputClass =
    "border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50 w-full";
  const labelClass = "text-[10px] uppercase tracking-widest text-muted";

  return (
    <section className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light text-charcoal">Settings</h1>
        <p className="text-xs text-muted mt-1">
          Hero copy updates publish to the homepage within 60 seconds. Shipping &amp; tax
          rates apply to all new orders immediately.
        </p>
      </div>

      {/* Sub-nav */}
      <nav className="flex gap-4 border-b border-gold/15 pb-4 text-[10px] uppercase tracking-widest">
        <span className="text-gold border-b-2 border-gold pb-1">Content &amp; Rates</span>
        <a
          href="/admin/settings/testimonials"
          className="text-charcoal/60 hover:text-gold transition-colors pb-1"
        >
          Testimonials
        </a>
      </nav>

      {/* ── HERO CONTENT ── */}
      <div className="border border-gold/15 bg-silk/10 p-6 space-y-5">
        <h2 className="font-display text-xl font-light text-charcoal">
          Homepage Hero Copy
        </h2>
        <p className="text-xs text-muted -mt-2">
          These fields control the text shown in the full-screen hero banner.
        </p>

        <form onSubmit={saveHero} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Supertitle (small text above headline)</label>
            <input
              value={hero.hero_supertitle}
              onChange={(e) => setHero((p) => ({ ...p, hero_supertitle: e.target.value }))}
              placeholder="Preserving Heritage, Weave by Weave"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Headline *</label>
            <input
              required
              value={hero.hero_headline}
              onChange={(e) => setHero((p) => ({ ...p, hero_headline: e.target.value }))}
              placeholder="Draped in Legacy & Grace"
              className={inputClass}
            />
            <p className="text-[10px] text-muted">
              The large display headline. The part after &amp; will appear in italic gold — use &amp; as a natural break point.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Subheadline</label>
            <textarea
              rows={3}
              value={hero.hero_subheadline}
              onChange={(e) => setHero((p) => ({ ...p, hero_subheadline: e.target.value }))}
              placeholder="Hand-woven masterpieces born from generational knowledge…"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Primary CTA Button</label>
              <input
                value={hero.hero_cta_primary}
                onChange={(e) => setHero((p) => ({ ...p, hero_cta_primary: e.target.value }))}
                placeholder="Explore Collections"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Secondary CTA Button</label>
              <input
                value={hero.hero_cta_secondary}
                onChange={(e) => setHero((p) => ({ ...p, hero_cta_secondary: e.target.value }))}
                placeholder="Our Heritage"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={heroSaving}
              className="px-6 py-2 bg-gold text-deep text-[10px] uppercase tracking-widest font-medium hover:bg-gold-light transition-colors disabled:opacity-50 cursor-pointer"
            >
              {heroSaving ? "Saving…" : "Save Hero Copy"}
            </button>
            {heroStatus === "saved" && (
              <span className="text-xs text-emerald-700">✓ Saved — homepage updates within 60 s</span>
            )}
            {heroStatus === "error" && (
              <span className="text-xs text-crimson">✗ Save failed. Try again.</span>
            )}
          </div>
        </form>
      </div>

      {/* ── SHIPPING & TAX ── */}
      <div className="border border-gold/15 bg-silk/10 p-6 space-y-5">
        <h2 className="font-display text-xl font-light text-charcoal">
          Shipping &amp; Tax
        </h2>
        <p className="text-xs text-muted -mt-2">
          Rates are applied server-side at checkout — changing them affects all new orders
          immediately. Existing paid orders are not retroactively changed.
        </p>

        <form onSubmit={saveShipping} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Flat Shipping Rate (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={shipping.shipping_flat_rupees}
                  onChange={(e) =>
                    setShipping((p) => ({ ...p, shipping_flat_rupees: e.target.value }))
                  }
                  className="border border-gold/20 bg-ivory pl-7 pr-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50 w-full"
                />
              </div>
              <p className="text-[10px] text-muted">Enter 0 for free shipping.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>GST / Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={shipping.tax_rate_percent}
                  onChange={(e) =>
                    setShipping((p) => ({ ...p, tax_rate_percent: e.target.value }))
                  }
                  className="border border-gold/20 bg-ivory px-3 pr-7 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50 w-full"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
              </div>
              <p className="text-[10px] text-muted">
                Applied on subtotal only. Enter 5 for 5% GST, 18 for 18% GST, 0 to disable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={shippingSaving}
              className="px-6 py-2 bg-gold text-deep text-[10px] uppercase tracking-widest font-medium hover:bg-gold-light transition-colors disabled:opacity-50 cursor-pointer"
            >
              {shippingSaving ? "Saving…" : "Save Rates"}
            </button>
            {shippingStatus === "saved" && (
              <span className="text-xs text-emerald-700">✓ Saved — new orders will use these rates</span>
            )}
            {shippingStatus === "error" && (
              <span className="text-xs text-crimson">✗ Invalid values or save failed.</span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
