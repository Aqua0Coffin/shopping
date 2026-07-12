export default function AdminSettingsPage() {
  return (
    <section className="border border-gold/15 bg-silk/10 p-6">
      <h1 className="font-display text-3xl font-light text-charcoal mb-2">Settings</h1>
      <p className="text-xs text-muted/80">
        Route is role-gated server-side. Shipping/tax config and homepage content blocks (testimonials + banners) will be built after auth review.
      </p>
    </section>
  );
}
