import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getAuthSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

import OrderDetailClient from "./OrderDetailClient";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: [],
  paid: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

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

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "staff")) {
    redirect("/auth/login?callbackUrl=/admin/orders");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, createdAt: true } },
      address: true,
      items: {
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              color: true,
              price: true,
              images: true,
              product: { select: { id: true, name: true, slug: true, fabricType: true } },
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const canRefund: boolean =
    !!(order.payment?.providerPaymentId &&
    order.payment?.status !== "refunded" &&
    (order.status === "paid" || order.status === "processing" || order.status === "shipped"));

  const nextStatuses = VALID_TRANSITIONS[order.status] || [];

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-charcoal">
            Order {order.id.slice(0, 12)}...
          </h1>
          <p className="text-xs text-muted mt-1 tracking-wide">
            Placed {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 border text-[10px] uppercase tracking-wider ${
            STATUS_COLORS[order.status] || "text-muted"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Fulfillment Controls */}
      <OrderDetailClient
        orderId={order.id}
        currentStatus={order.status}
        trackingNumber={order.trackingNumber}
        nextStatuses={nextStatuses}
        canRefund={canRefund}
        paymentStatus={order.payment?.status || null}
        paymentAmount={order.payment?.amount || order.total}
      />

      {/* Order Items */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-4 font-semibold">
          Items ({order.items.length})
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-gold/10 bg-silk/10 p-4"
            >
              <div className="flex items-center gap-4">
                {item.variant.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.variant.images[0]}
                    alt=""
                    className="w-14 h-20 object-cover border border-gold/5"
                  />
                ) : (
                  <div className="w-14 h-20 bg-silk/30 border border-gold/5 flex items-center justify-center">
                    <span className="text-[8px] text-muted uppercase tracking-wider">No img</span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-charcoal font-medium">
                    {item.variant.product.name}
                  </p>
                  <p className="text-[10px] text-muted tracking-wider mt-0.5">
                    {item.variant.product.fabricType} &middot; {item.variant.color}
                  </p>
                  <p className="text-[10px] text-muted font-mono tracking-wider mt-0.5">
                    SKU: {item.variant.sku}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-charcoal">{formatPrice(item.priceAtPurchase)}</p>
                <p className="text-[10px] text-muted">Qty: {item.quantity}</p>
                <p className="text-xs text-charcoal/70 font-medium mt-1">
                  {formatPrice(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border border-gold/10 bg-silk/10 p-4">
        <div className="space-y-1.5 max-w-xs ml-auto">
          <div className="flex justify-between text-xs text-charcoal/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-charcoal/70">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-xs text-charcoal/70">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-charcoal border-t border-gold/10 pt-1.5 mt-1.5">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
          Shipping Address
        </h2>
        <div className="border border-gold/10 bg-silk/10 p-4 text-xs text-charcoal/80 space-y-1">
          <p>{order.address.line1}</p>
          {order.address.line2 && <p>{order.address.line2}</p>}
          <p>
            {order.address.city}, {order.address.state} &mdash; {order.address.pincode}
          </p>
          <p>Phone: {order.address.phone}</p>
        </div>
      </div>

      {/* Payment Details */}
      {order.payment && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
            Payment Details
          </h2>
          <div className="border border-gold/10 bg-silk/10 p-4 text-xs text-charcoal/80 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Provider</span>
              <span className="uppercase tracking-wider">{order.payment.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <span>{order.payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Razorpay Order ID</span>
              <span className="font-mono text-[10px]">{order.payment.providerOrderId}</span>
            </div>
            {order.payment.providerPaymentId && (
              <div className="flex justify-between">
                <span className="text-muted">Razorpay Payment ID</span>
                <span className="font-mono text-[10px]">{order.payment.providerPaymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Amount</span>
              <span>{formatPrice(order.payment.amount)}</span>
            </div>
            {order.payment.signatureVerified && (
              <div className="flex justify-between text-emerald-600">
                <span>Signature</span>
                <span>Verified</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Info */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-gold mb-3 font-semibold">
          Customer
        </h2>
        <div className="border border-gold/10 bg-silk/10 p-4 text-xs text-charcoal/80 space-y-1">
          <p>Email: {order.user.email}</p>
          <p>
            Customer since:{" "}
            {new Date(order.user.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/admin/orders"
        className="inline-block text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
      >
        &larr; Back to Orders
      </Link>
    </section>
  );
}