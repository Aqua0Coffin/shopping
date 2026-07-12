import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [ordersToday, paidOrders, lowStockItems, customerCount] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.inventory.count({
      where: {
        stockQty: { lte: 5 },
      },
    }),
    prisma.user.count({ where: { role: "customer" } }),
  ]);

  const cards = [
    { label: "Orders Today", value: ordersToday },
    { label: "Paid Orders", value: paidOrders },
    { label: "Low-Stock SKUs", value: lowStockItems },
    { label: "Customers", value: customerCount },
  ];

  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl font-light text-charcoal">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <article key={card.label} className="border border-gold/15 bg-silk/10 p-5">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">{card.label}</p>
            <p className="font-display text-3xl text-gold mt-2">{card.value}</p>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted/80">
        Auth and role-gating are now active. CRUD modules (products, inventory, orders, customers, settings content blocks) are next.
      </p>
    </section>
  );
}
