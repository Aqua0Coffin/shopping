import Link from "next/link";
import Button from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function OrdersPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return (
      <div className="py-28 px-6 sm:px-8 max-w-md mx-auto bg-ivory font-sans flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border border-gold/25 flex items-center justify-center mb-8 relative bg-silk/15">
          <div className="absolute inset-1.5 border border-gold/10 rounded-full" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.2}
            stroke="currentColor"
            className="w-8 h-8 text-gold"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-light text-charcoal mb-4">Your digital chronicle</h1>
        <p className="text-xs text-muted/70 leading-relaxed font-light mb-8 max-w-xs">
          Sign in to view your order history, shipping status, and certificates.
        </p>

        <div className="w-full flex flex-col gap-3">
          <Button variant="primary" href="/auth/login?callbackUrl=/orders" className="w-full !py-4">
            Sign In
          </Button>
          <Button variant="outline" href="/auth/signup" className="w-full !py-4">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          quantity: true,
          priceAtPurchase: true,
          variant: {
            select: {
              color: true,
              product: {
                select: { name: true },
              },
            },
          },
        },
      },
      payment: {
        select: {
          status: true,
          providerPaymentId: true,
        },
      },
    },
  });

  return (
    <div className="py-28 px-6 sm:px-8 max-w-5xl mx-auto bg-ivory font-sans">
      <div className="mb-10 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal">Your Orders</h1>
          <p className="text-xs text-muted/70 leading-relaxed font-light mt-2">
            Signed in as {session.user.email}
          </p>
        </div>
        <Link
          href="/api/auth/signout?callbackUrl=/"
          className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors duration-300 font-medium"
        >
          Sign Out
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="border border-gold/15 bg-silk/10 p-10 text-center">
          <p className="font-display text-2xl text-charcoal mb-3">No orders yet</p>
          <p className="text-xs text-muted/70 mb-6">Your confirmed purchases will appear here.</p>
          <Button variant="primary" href="/collections">
            Explore Collections
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <article key={order.id} className="border border-gold/15 bg-silk/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/10 pb-4 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Order ID</p>
                  <p className="text-sm text-charcoal break-all">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted">Status</p>
                  <p className="text-sm text-gold uppercase tracking-wide">{order.status}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="text-charcoal">{item.variant.product.name}</p>
                      <p className="text-xs text-muted/80">Color: {item.variant.color} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-display text-charcoal">{formatPrice(item.priceAtPurchase * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between gap-3 text-xs">
                <p className="text-muted/80">
                  Placed on {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
                </p>
                <p className="font-display text-lg text-crimson">{formatPrice(order.total)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        href="/collections"
        className="inline-block mt-8 text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors duration-300 font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
