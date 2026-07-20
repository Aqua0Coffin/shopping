import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrderStatus, Prisma } from "@prisma/client";

export const metadata = { title: "Orders — Sakhy Admin" };

const STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  pending:    { dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50   border-amber-200/60" },
  paid:       { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200/60" },
  processing: { dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50    border-blue-200/60" },
  shipped:    { dot: "bg-indigo-400",  text: "text-indigo-700",  bg: "bg-indigo-50  border-indigo-200/60" },
  delivered:  { dot: "bg-emerald-600", text: "text-emerald-800", bg: "bg-emerald-50 border-emerald-300/60" },
  cancelled:  { dot: "bg-red-400",     text: "text-red-700",     bg: "bg-red-50     border-red-200/60" },
  refunded:   { dot: "bg-stone-400",   text: "text-stone-600",   bg: "bg-stone-50   border-stone-200/60" },
};

function parseDateFilter(value: string | undefined, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; sort?: string; startDate?: string; endDate?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/orders");
  }

  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const searchQuery  = sp.search   || "";
  const sortOrder    = sp.sort     || "newest";
  const startDate    = sp.startDate || "";
  const endDate      = sp.endDate  || "";

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
  const endDateFilter   = parseDateFilter(endDate, true);
  if (startDateFilter || endDateFilter) {
    where.createdAt = {
      ...(startDateFilter ? { gte: startDateFilter } : {}),
      ...(endDateFilter   ? { lte: endDateFilter   } : {}),
    };
  }

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const values = {
      status:    statusFilter || undefined,
      search:    searchQuery  || undefined,
      sort:      sortOrder    || undefined,
      startDate: startDate    || undefined,
      endDate:   endDate      || undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(values)) if (v) params.set(k, v);
    const q = params.toString();
    return q ? `/admin/orders?${q}` : "/admin/orders";
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: sortOrder === "oldest" ? "asc" : "desc" },
    take: 100,
    include: {
      user:    { select: { id: true, email: true } },
      address: { select: { line1: true, city: true, state: true } },
      payment: { select: { status: true, providerPaymentId: true } },
      _count:  { select: { items: true } },
    },
  });

  const statuses = Object.values(OrderStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[2rem] font-light text-[#1A0A00] leading-none">Orders</h1>
          <p className="mt-1 text-[11px] text-[#8A7B6A] uppercase tracking-widest font-sans">
            {orders.length} result{orders.length !== 1 ? "s" : ""}
            {statusFilter ? ` · ${statusFilter}` : ""}
          </p>
        </div>
      </div>

      {/* Search + date filter */}
      <form
        id="orders-search-form"
        method="GET"
        action="/admin/orders"
        className="flex flex-wrap gap-2"
      >
        <input
          type="text"
          id="orders-search-input"
          name="search"
          defaultValue={searchQuery}
          placeholder="Search order ID or email…"
          className="
            flex-1 min-w-[200px] rounded border border-[#B08D5E]/20 bg-white
            px-3 py-2.5 text-xs text-[#1A0A00] placeholder:text-[#8A7B6A]/60
            focus:outline-none focus:border-[#B08D5E] transition-colors font-sans
          "
        />
        <input
          type="date"
          name="startDate"
          id="orders-start-date"
          defaultValue={startDate}
          aria-label="Orders from date"
          className="rounded border border-[#B08D5E]/20 bg-white px-3 py-2.5 text-xs text-[#1A0A00] focus:outline-none focus:border-[#B08D5E] transition-colors font-sans"
        />
        <input
          type="date"
          name="endDate"
          id="orders-end-date"
          defaultValue={endDate}
          aria-label="Orders through date"
          className="rounded border border-[#B08D5E]/20 bg-white px-3 py-2.5 text-xs text-[#1A0A00] focus:outline-none focus:border-[#B08D5E] transition-colors font-sans"
        />
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input type="hidden" name="sort" value={sortOrder} />
        <button
          type="submit"
          id="orders-search-btn"
          className="rounded px-4 py-2.5 bg-[#B08D5E] text-white text-[10px] tracking-widest uppercase hover:bg-[#C9AC7E] transition-colors font-sans"
        >
          Search
        </button>
      </form>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ status: undefined })}
          className={`
            rounded-full px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors font-sans
            ${!statusFilter
              ? "border-[#B08D5E] bg-[#B08D5E] text-white"
              : "border-[#B08D5E]/20 text-[#8A7B6A] hover:border-[#B08D5E]/50"
            }
          `}
        >
          All
        </Link>
        {statuses.map((s) => {
          const st = STATUS_STYLE[s];
          const active = statusFilter === s;
          return (
            <Link
              key={s}
              href={buildUrl({ status: s })}
              className={`
                rounded-full px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors font-sans
                ${active
                  ? `${st?.bg ?? ""} ${st?.text ?? ""} border-current`
                  : "border-[#B08D5E]/20 text-[#8A7B6A] hover:border-[#B08D5E]/50"
                }
              `}
            >
              {s}
            </Link>
          );
        })}
        <div className="ml-auto flex gap-2">
          {(["newest", "oldest"] as const).map((s) => (
            <Link
              key={s}
              href={buildUrl({ sort: s })}
              className={`
                rounded px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors font-sans
                ${sortOrder === s
                  ? "border-[#B08D5E]/40 text-[#B08D5E] bg-[#B08D5E]/5"
                  : "border-[#B08D5E]/15 text-[#8A7B6A] hover:border-[#B08D5E]/35"
                }
              `}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-[#B08D5E]/15 bg-white px-6 py-14 text-center">
          <p className="text-[#8A7B6A] text-xs">No orders found matching these filters.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#B08D5E]/15 bg-white overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-[#B08D5E]/10">
                {["Order", "Customer", "Items", "Total", "Status", "Payment", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => {
                const st = STATUS_STYLE[order.status];
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-[#F5EFE9]/60 transition-colors ${
                      i !== orders.length - 1 ? "border-b border-[#B08D5E]/6" : ""
                    }`}
                  >
                    <td className="pl-6 pr-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[#B08D5E] hover:text-[#C9AC7E] tracking-wide transition-colors"
                      >
                        #{order.id.slice(0, 10)}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[#1A0A00]">{order.user.email}</p>
                      <p className="text-[#8A7B6A] text-[10px] mt-0.5">
                        {order.address.city}, {order.address.state}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[#2C2416]/70 tabular-nums">
                      {order._count.items}
                    </td>
                    <td className="px-4 py-4 text-[#1A0A00] font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${st?.bg ?? "bg-stone-50 border-stone-200"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st?.dot ?? "bg-stone-400"}`} />
                        <span className={`text-[10px] uppercase tracking-wider ${st?.text ?? "text-stone-600"}`}>
                          {order.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#8A7B6A]">
                      {order.payment?.status ?? "—"}
                    </td>
                    <td className="px-4 py-4 pr-6 text-[#8A7B6A] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}