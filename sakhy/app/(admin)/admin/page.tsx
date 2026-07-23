import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

const STATUS_DOT: Record<string, string> = {
  pending:    "bg-amber-400",
  paid:       "bg-emerald-500",
  processing: "bg-blue-400",
  shipped:    "bg-indigo-400",
  delivered:  "bg-emerald-600",
  cancelled:  "bg-red-400",
  refunded:   "bg-stone-400",
};

export const metadata = { title: "Dashboard — Sakhy Admin" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf30DaysAgo = new Date(now);
  startOf30DaysAgo.setDate(now.getDate() - 30);

  const [
    ordersToday,
    paidOrders,
    lowStockItems,
    customerCount,
    revenueResult,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "paid" } }),
    // Count SKUs where stockQty is at or below their configured threshold
    // (done in two steps: fetch, then count in memory — same pattern as inventory page)
    prisma.inventory.count({ where: { stockQty: { lte: 5 } } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["paid", "processing", "shipped", "delivered"] }, createdAt: { gte: startOf30DaysAgo } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  const revenue30d = revenueResult._sum.total ?? 0;

  const statCards = [
    {
      id: "orders-today",
      label: "Orders Today",
      value: ordersToday,
      href: "/admin/orders",
      note: "All time",
      accent: false,
    },
    {
      id: "paid-orders",
      label: "Awaiting Fulfil",
      value: paidOrders,
      href: "/admin/orders?status=paid",
      note: "paid status",
      accent: paidOrders > 0,
    },
    {
      id: "low-stock",
      label: "Low-Stock SKUs",
      value: lowStockItems,
      href: "/admin/inventory?lowStock=1",
      note: "at threshold",
      accent: lowStockItems > 0,
      danger: lowStockItems > 0,
    },
    {
      id: "customers",
      label: "Customers",
      value: customerCount,
      href: "/admin/customers",
      note: "registered",
      accent: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-[2rem] font-light text-[#1A0A00] leading-none tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-[11px] text-[#8A7B6A] uppercase tracking-widest">
          {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.id}
            id={card.id}
            href={card.href}
            className={`
              group relative rounded-lg border p-5 transition-all duration-200
              hover:shadow-md hover:-translate-y-px
              ${card.danger
                ? "border-[#8B1A1A]/20 bg-[#8B1A1A]/[0.03] hover:border-[#8B1A1A]/40"
                : "border-[#B08D5E]/15 bg-white hover:border-[#B08D5E]/40"
              }
            `}
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-[#8A7B6A] font-sans mb-3">
              {card.label}
            </p>
            <p className={`font-display text-4xl font-light leading-none ${card.danger ? "text-[#8B1A1A]" : "text-[#B08D5E]"}`}>
              {card.value}
            </p>
            <p className="mt-2 text-[10px] text-[#8A7B6A]">{card.note}</p>
            <span className="absolute bottom-4 right-4 text-[#B08D5E]/0 group-hover:text-[#B08D5E]/60 transition-colors text-xs">
              →
            </span>
          </Link>
        ))}
      </div>

      {/* Revenue strip */}
      <div className="rounded-lg border border-[#B08D5E]/15 bg-[#120800] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-sans">
            Revenue — Last 30 days
          </p>
          <p className="font-display text-2xl text-[#B08D5E] mt-1">
            {formatPrice(revenue30d)}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-[10px] uppercase tracking-widest text-[#B08D5E]/60 hover:text-[#B08D5E] transition-colors font-sans"
        >
          All orders →
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#8A7B6A] font-sans">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-[10px] uppercase tracking-widest text-[#B08D5E] hover:text-[#C9AC7E] transition-colors font-sans"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-lg border border-[#B08D5E]/15 bg-white overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-[#8A7B6A] text-xs">
              No orders yet.
            </div>
          ) : (
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="border-b border-[#B08D5E]/10">
                  <th className="px-5 py-3 text-left text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal">
                    Order
                  </th>
                  <th className="px-5 py-3 text-left text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-right text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal">
                    Total
                  </th>
                  <th className="px-5 py-3 text-center text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-[#F5EFE9]/60 transition-colors ${
                      i !== recentOrders.length - 1 ? "border-b border-[#B08D5E]/6" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[#B08D5E] hover:text-[#C9AC7E] tracking-wide"
                      >
                        #{order.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#2C2416]/70 truncate max-w-[180px]">
                      {order.user.email}
                    </td>
                    <td className="px-5 py-3 text-right text-[#1A0A00] font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[order.status] ?? "bg-stone-400"}`} />
                        <span className="text-[10px] uppercase tracking-wider text-[#2C2416]/70">
                          {order.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-[#8A7B6A] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
