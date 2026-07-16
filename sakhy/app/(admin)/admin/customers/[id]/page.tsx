import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

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
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/customers");
  }

  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      addresses: {
        select: {
          id: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          pincode: true,
          phone: true,
          isDefault: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer || customer.role !== "customer") {
    notFound();
  }

  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      _count: { select: { items: true } },
      payment: { select: { status: true } },
    },
  });

  const orderAggs = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: id, status: { not: "cancelled" } },
    _sum: { total: true },
  });

  const totalSpent = orderAggs[0]?._sum.total || 0;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-charcoal">Customer</h1>
          <p className="text-sm text-charcoal/80 mt-1">{customer.email}</p>
          <p className="text-[10px] text-muted mt-0.5 tracking-wide">
            Joined {new Date(customer.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted tracking-wider uppercase">Total Spent</p>
          <p className="font-display text-2xl text-gold font-light">{formatPrice(totalSpent)}</p>
          <p className="text-[10px] text-muted">{orders.length} order(s)</p>
        </div>
      </div>

      {/* Addresses */}
      {customer.addresses.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">Addresses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`border p-3 text-xs text-charcoal/80 ${
                  addr.isDefault ? "border-gold/30 bg-gold/5" : "border-gold/10 bg-silk/10"
                }`}
              >
                {addr.isDefault && (
                  <span className="text-[9px] uppercase tracking-wider text-gold block mb-1">Default</span>
                )}
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} &mdash; {addr.pincode}
                </p>
                <p className="text-muted mt-0.5">{addr.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-4 font-semibold">
          Order History ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="border border-gold/15 bg-silk/10 p-6 text-center">
            <p className="text-xs text-muted/80">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gold/15">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-silk/20 border-b border-gold/15">
                  <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Order ID</th>
                  <th className="text-center px-4 py-3 text-muted tracking-wider uppercase font-normal">Items</th>
                  <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Total</th>
                  <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Status</th>
                  <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Payment</th>
                  <th className="text-left px-4 py-3 text-muted tracking-wider uppercase font-normal">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gold/5 hover:bg-gold/5 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono tracking-wider text-charcoal/80">
                      {order.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3.5 text-center text-charcoal/80">
                      {order._count.items}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 border text-[10px] uppercase tracking-wider ${
                          STATUS_COLORS[order.status] || "text-muted"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{order.payment?.status || "—"}</td>
                    <td className="px-4 py-3.5 text-charcoal/60 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-gold hover:text-gold-light text-[10px] uppercase tracking-wider"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back link */}
      <a
        href="/admin/customers"
        className="inline-block text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
      >
        &larr; Back to Customers
      </a>
    </section>
  );
}