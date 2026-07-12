export default function AdminInventoryPage() {
  return (
    <section className="border border-gold/15 bg-silk/10 p-6">
      <h1 className="font-display text-3xl font-light text-charcoal mb-2">Inventory</h1>
      <p className="text-xs text-muted/80">
        Route is role-gated server-side. Stock management and inventory audit log interfaces will be built after auth review.
      </p>
    </section>
  );
}
