import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderStatus, Prisma } from "@prisma/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-400/20 text-amber-600 border-amber-400/30",
  paid: "bg-emerald-400/20 text-emerald-600 border-emerald-400/30",
  processing: "bg-blue-400/20 text-blue-600 border-blue-400/30",
  shipped: "bg-indigo-400/20 text-indigo-600 border-indigo-400/30",
  delivered: "bg-green-400/20 text-green-700 border-green-400/30",
  cancelled: "bg-red-400/20 text-red-600 border-red-400/30",
  refunded: "bg-gray-400/20 text-gray-600 border-gray-400/30",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

function parseDateFilter(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/orders");
  }

  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const searchQuery = sp.search || "";
  const sortOrder = sp.sort || "newest";
  const startDate = sp.startDate || "";
  const endDate = sp.endDate || "";

  const where: Prisma.OrderWhereInput = {};

  if (statusFilter && Object.values(OrderStatus).includes(statusFilter as OrderStatus)) {
    where.status = statusFilter as OrderStatus;
  }

  if (searchQuery) {
    where.OR = [
      { id: { contains: searchQuery, mode: "insensitive" } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  const startDateFilter = parseDateFilter(startDate);
  const endDateFilter = parseDateFilter(endDate, true);
  if (startDateFilter || endDateFilter) {
    where.createdAt = {
      ...(startDateFilter ? { gte: startDateFilter } : {}),
      ...(endDateFilter ? { lte: endDateFilter } : {}),
    };
  }

  const orderQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const values = {
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      sort: sortOrder || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      ...overrides,
    };

    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value);
    }

    const query = params.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: sortOrder === "oldest" ? "asc" : "desc" },
    take: 100,
    include: {
      user: { select: { id: true, email: true } },
      address: { select: { line1: true, city: true, state: true } },
      payment: { select: { status: true, providerPaymentId: true } },
      _count: { select: { items: true } },
    },
  });

  const statuses = Object.values(OrderStatus);

  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl font-light text-charcoal">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted tracking-wider uppercase">Filter:</span>
        <Link
          href={orderQuery({ status: undefined })}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            !statusFilter
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={orderQuery({ status: s })}
            className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
              statusFilter === s
                ? "border-gold text-gold bg-gold/5"
                : "border-gold/15 text-muted hover:border-gold/40"
            }`}
          >
            {s}
          </Link>
        ))}

        <span className="ml-4 text-muted tracking-wider uppercase">Sort:</span>
        <Link
          href={orderQuery({ sort: "newest" })}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "newest"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Newest
        </Link>
        <Link
          href={orderQuery({ sort: "oldest" })}
          className={`px-3 py-1.5 border tracking-wider uppercase transition-colors ${
            sortOrder === "oldest"
              ? "border-gold text-gold bg-gold/5"
              : "border-gold/15 text-muted hover:border-gold/40"
          }`}
        >
          Oldest
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/orders" className="flex flex-wrap gap-2">
        <input
          type="text"
          name="search"
          defaultValue={searchQuery}
          placeholder="Search by order ID or email..."
          className="flex-1 border border-gold/30 bg-transparent p-2.5 text-xs focus:outline-none focus:border-gold"
        />
        <input
          type="date"
          name="startDate"
          defaultValue={startDate}
          aria-label="Orders from date"
          className="border border-gold/30 bg-transparent p-2.5 text-xs focus:outline-none focus:border-gold"
        />
        <input
          type="date"
          name="endDate"
          defaultValue={endDate}
          aria-label="Orders through date"
          className="border border-gold/30 bg-transparent p-2.5 text-xs focus:outline-none focus:border-gold"
        />
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input type="hidden" name="sort" value={sortOrder} />
        <button
          type="submit"
          className="px-4 py-2.5 border border-gold/30 text-xs tracking-wider uppercase text-gold hover:bg-gold/5 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="border border-gold/15 bg-silk/10 p-8 text-center">
          <p className="text-xs text-muted/80">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gold/15">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-silk/20 border-b border-gold/15">
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Order ID</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Customer</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Items</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Total</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Status</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Payment</th>
                <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gold/5 hover:bg-gold/5 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-gold hover:text-gold-light font-mono tracking-wider"
                    >
                      {order.id.slice(0, 12)}...
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-charcoal/80">
                    {order.user.email}
                    <span className="block text-muted text-[10px]">
                      {order.address.city}, {order.address.state}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-charcoal/80 text-center">
                    {order._count.items}
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 border text-[10px] uppercase tracking-wider ${
                        STATUS_COLORS[order.status] || "text-muted"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-muted">
                      {order.payment?.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-charcoal/60 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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