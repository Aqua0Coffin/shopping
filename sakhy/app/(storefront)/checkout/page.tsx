"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    email: string;
    contact: string;
  };
  handler: () => void;
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CheckoutResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  reservationExpiresAt: string;
  customer: {
    email: string;
    phone: string;
  };
}

const initialForm = {
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { state, cartTotal, cartCount, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: state.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout could not be started.");
      }

      const checkout = data as CheckoutResponse;
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: "Sakhy",
        description: `${cartCount} heritage creation${cartCount === 1 ? "" : "s"}`,
        order_id: checkout.razorpayOrderId,
        prefill: {
          email: checkout.customer.email,
          contact: checkout.customer.phone,
        },
        handler: () => {
          clearCart();
          setNotice(
            "Payment received by Razorpay. Your order will update after the verified webhook confirms capture."
          );
        },
        modal: {
          ondismiss: () => {
            setNotice(
              `Payment was not completed. Reserved stock releases automatically after ${new Date(
                checkout.reservationExpiresAt
              ).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`
            );
          },
        },
        theme: {
          color: "#C9A84C",
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed in Razorpay. Stock reservation will be released by the verified webhook or timeout.");
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not be started.");
    } finally {
      setLoading(false);
    }
  };

  if (state.items.length === 0 && !notice) {
    return (
      <div className="py-28 px-6 sm:px-8 max-w-md mx-auto bg-ivory font-sans text-center">
        <h1 className="font-display text-3xl font-light text-charcoal mb-4">
          Your bag is empty
        </h1>
        <p className="text-xs text-muted/70 leading-relaxed font-light mb-8">
          Add a heritage creation before beginning checkout.
        </p>
        <Button variant="primary" href="/collections">
          Browse Creations
        </Button>
      </div>
    );
  }

  return (
    <div className="py-28 px-6 sm:px-8 max-w-6xl mx-auto bg-ivory font-sans">
      <div className="mb-10">
        <Link
          href="/cart"
          className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors duration-300 font-medium"
        >
          Back to Bag
        </Link>
        <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal mt-4">
          Secure Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
        <form
          onSubmit={handleSubmit}
          className="border border-gold/15 bg-silk/5 p-6 sm:p-8"
        >
          <span className="text-xs uppercase tracking-widest font-medium text-charcoal border-b border-gold/15 pb-3 block mb-6">
            Shipping Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              Mobile
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              Address Line 1
              <input
                required
                value={form.line1}
                onChange={(event) => updateField("line1", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              Address Line 2
              <input
                value={form.line2}
                onChange={(event) => updateField("line2", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              City
              <input
                required
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              State
              <input
                required
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-muted">
              Pincode
              <input
                required
                inputMode="numeric"
                value={form.pincode}
                onChange={(event) => updateField("pincode", event.target.value)}
                className="border border-gold/20 bg-ivory px-4 py-3 text-sm normal-case tracking-normal text-charcoal outline-none focus:border-gold"
              />
            </label>
          </div>

          {error && (
            <div className="mt-6 text-[11px] text-crimson bg-crimson/5 border border-crimson/15 px-4 py-3 leading-relaxed">
              {error}
            </div>
          )}

          {notice && (
            <div className="mt-6 text-[11px] text-charcoal bg-gold/10 border border-gold/20 px-4 py-3 leading-relaxed">
              {notice}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full !py-4 mt-8">
            Pay Securely with Razorpay
          </Button>
        </form>

        <aside className="border border-gold/15 bg-silk/10 p-6">
          <span className="text-xs uppercase tracking-widest font-medium text-charcoal border-b border-gold/15 pb-3 block mb-5">
            Order Summary
          </span>
          <div className="flex flex-col gap-4">
            {state.items.map((item) => (
              <div key={item.variantId} className="flex justify-between gap-4 text-xs text-charcoal/80">
                <div>
                  <span className="font-display text-base text-charcoal block">
                    {item.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted">
                    {item.color} x {item.quantity}
                  </span>
                </div>
                <span className="font-display text-base text-crimson whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-[1px] bg-gold/10 my-5" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-charcoal">Total</span>
            <span className="font-display text-2xl text-crimson">
              {formatPrice(cartTotal)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
