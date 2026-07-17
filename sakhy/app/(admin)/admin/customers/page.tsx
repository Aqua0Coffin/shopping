import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
  }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/customers");
  }

  const sp = await searchParams;
  const searchQuery = sp.search || "";
  const sortOrder = sp.sort || "newest";

  const where: Prisma.UserWhereInput = { role: "customer" };

  if (searchQuery) {
    where.OR = [
      { email: { contains: searchQuery, mode: "insensitive" } },
      { id: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sortOrder === "oldest" ? { createdAt: "asc" as const }
    : sortOrder === "newest" ? { createdAt: "desc" as const }
    : { createdAt: "desc" as const };

  const customers = await prisma.user.findMany({
    where,
    orderBy,
    take: 100,
    select: {
      id: true,
      email: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  // Enrich with total spent
  const customerIds = customers.map((c) => c.id);
  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: customerIds }, status: { not: "cancelled" } },
    _sum: { total: true },
  });

  const aggMap = new Map(orderAggs.map((a) => [a.userId, a._sum.total || 0]));

  const enriched = customers.map((c) => ({
    id: c.id,
    email: c.email,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpent: aggMap.get(c.id) || 0,
  }));

  // Sort by spent or orders if requested
  const sorted =
    sortOrder === "spent"
      ? [...enriched].sort((a, b) => b.totalSpent - a.totalSpent)
      : sortOrder === "orders"
        ? [...enriched].sort((a, b) => b.orderCount - a.orderCount)
        : enriched;

  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl font-light text-charcoal">Customers</h1>

      {/* Sort */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted tracking-wider uppercase">Sort:</span>
        <Link
          href={`/admin/customers?${new URLSearchParams({ ...(searchQuery ? { search: searchQuery } : {}), sort: "newest" }).toString()}`}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "newest"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Newest
        </Link>
        <Link
          href={`/admin/customers?${new URLSearchParams({ ...(searchQuery ? { search: searchQuery } : {}), sort: "oldest" }).toString()}`}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "oldest"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Oldest
        </Link>
        <Link
          href={`/admin/customers?${new URLSearchParams({ ...(searchQuery ? { search: searchQuery } : {}), sort: "orders" }).toString()}`}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "orders"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Most Orders
        </Link>
        <Link
          href={`/admin/customers?${new URLSearchParams({ ...(searchQuery ? { search: searchQuery } : {}), sort: "spent" }).toString()}`}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "spent"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Most Spent
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/customers" className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={searchQuery}
          placeholder="Search by email or ID..."
          className="flex-1 border border-gold/30 bg-transparent p-2.5 text-xs focus:outline-none focus:border-gold"
        />
        <input type="hidden" name="sort" value={sortOrder} />
        <button
          type="submit"
          className="px-4 py-2.5 border border-gold/30 text-xs tracking-wider uppercase text-gold hover:bg-gold/5 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Customers Table */}
      {sorted.length === 0 ? (
        <div className="border border-gold/15 bg-silk/10 p-8 text-center">
          <p className="text-xs text-muted/80">No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gold/15">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-silk/20 border-b border-gold/15">
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Email</th>
                <th className="text-center px-4 py-3 text-muted tracking-wider uppercase font-normal">Orders</th>
                <th className="text-center px-4 py-3 text-muted tracking-wider uppercase font-normal">Total Spent</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Joined</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gold/5 hover:bg-gold/5 transition-colors"
                >
                  <td className="px-4 py-3.5 text-charcoal/80">{customer.email}</td>
                  <td className="px-4 py-3.5 text-center text-charcoal/80">{customer.orderCount}</td>
                  <td className="px-4 py-3.5 text-center font-medium">
                    {customer.totalSpent > 0 ? formatPrice(customer.totalSpent) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-charcoal/60 whitespace-nowrap">
                    {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-gold hover:text-gold-light text-[10px] uppercase tracking-wider"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}