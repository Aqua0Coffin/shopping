export default function AdminProductsPage() {
  return (
    <section className="border border-gold/15 bg-silk/10 p-6">
      <h1 className="font-display text-3xl font-light text-charcoal mb-2">Products</h1>
      <p className="text-xs text-muted/80">
        Route is role-gated server-side. Full product CRUD, variants, and secure image upload validation will be implemented after auth review.
      </p>
    </section>
  );
}
