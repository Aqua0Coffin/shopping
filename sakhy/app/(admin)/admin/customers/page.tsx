import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const metadata = { title: "Customers — Sakhy Admin" };

interface PageProps {
  searchParams: Promise<{ search?: string; sort?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/customers");
  }

  const sp = await searchParams;
  const searchQuery = sp.search || "";
  const sortOrder   = sp.sort   || "newest";

  const where: Prisma.UserWhereInput = { role: "customer" };
  if (searchQuery) {
    where.OR = [
      { email: { contains: searchQuery, mode: "insensitive" } },
      { id: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sortOrder === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

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

  const customerIds = customers.map((c) => c.id);
  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: customerIds }, status: { not: "cancelled" } },
    _sum: { total: true },
  });
  const aggMap = new Map(orderAggs.map((a) => [a.userId, a._sum.total ?? 0]));

  const enriched = customers.map((c) => ({
    id: c.id,
    email: c.email,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpent: aggMap.get(c.id) ?? 0,
  }));

  const sorted =
    sortOrder === "spent"
      ? [...enriched].sort((a, b) => b.totalSpent - a.totalSpent)
      : sortOrder === "orders"
        ? [...enriched].sort((a, b) => b.orderCount - a.orderCount)
        : enriched;

  const buildUrl = (s: string) => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("search", searchQuery);
    p.set("sort", s);
    return `/admin/customers?${p.toString()}`;
  };

  const sortOptions = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "orders", label: "Most Orders" },
    { key: "spent",  label: "Most Spent" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-[2rem] font-light text-[#1A0A00] leading-none">Customers</h1>
        <p className="mt-1 text-[11px] text-[#8A7B6A] uppercase tracking-widest font-sans">
          {sorted.length} result{sorted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search + sort row */}
      <div className="flex flex-wrap gap-3 items-center">
        <form id="customers-search-form" method="GET" action="/admin/customers" className="flex gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            id="customers-search-input"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by email or ID…"
            className="flex-1 rounded border border-[#B08D5E]/20 bg-white px-3 py-2.5 text-xs text-[#1A0A00] placeholder:text-[#8A7B6A]/60 focus:outline-none focus:border-[#B08D5E] transition-colors font-sans"
          />
          <input type="hidden" name="sort" value={sortOrder} />
          <button
            type="submit"
            id="customers-search-btn"
            className="rounded px-4 py-2.5 bg-[#B08D5E] text-white text-[10px] tracking-widest uppercase hover:bg-[#C9AC7E] transition-colors font-sans"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {sortOptions.map(({ key, label }) => (
            <Link
              key={key}
              href={buildUrl(key)}
              className={`
                rounded px-3 py-2 text-[10px] uppercase tracking-wider border transition-colors font-sans
                ${sortOrder === key
                  ? "border-[#B08D5E]/40 bg-[#B08D5E]/5 text-[#B08D5E]"
                  : "border-[#B08D5E]/15 text-[#8A7B6A] hover:border-[#B08D5E]/35"
                }
              `}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-[#B08D5E]/15 bg-white px-6 py-14 text-center">
          <p className="text-[#8A7B6A] text-xs">No customers found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#B08D5E]/15 bg-white overflow-hidden overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="border-b border-[#B08D5E]/10">
                {["Email", "Orders", "Total Spent", "Joined", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`py-3.5 text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal ${
                      i === 0 ? "pl-6 pr-4 text-left"
                      : i === 4 ? "pr-6 pl-4 text-right"
                      : "px-4 text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.id}
                  id={`customer-row-${c.id}`}
                  className={`hover:bg-[#F5EFE9]/60 transition-colors ${
                    i !== sorted.length - 1 ? "border-b border-[#B08D5E]/6" : ""
                  }`}
                >
                  <td className="pl-6 pr-4 py-4 text-[#1A0A00]">{c.email}</td>
                  <td className="px-4 py-4 text-[#2C2416]/70 tabular-nums">{c.orderCount}</td>
                  <td className="px-4 py-4 text-[#1A0A00] font-medium tabular-nums">
                    {c.totalSpent > 0 ? formatPrice(c.totalSpent) : "—"}
                  </td>
                  <td className="px-4 py-4 text-[#8A7B6A] whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="pr-6 pl-4 py-4 text-right">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="text-[10px] uppercase tracking-widest text-[#B08D5E] hover:text-[#C9AC7E] transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}