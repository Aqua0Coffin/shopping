"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Footer — reference-styled light theme:
 * - Light background (bg-secondary/30) replacing dark bg-deep
 * - Ink text instead of ivory
 * - Social icons as rounded-full bordered buttons (reference pattern)
 * - Same functional newsletter API call preserved
 */
export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Newsletter subscription — API call fully preserved
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setMessage("Thank you. You have been added to our digital chronicle.");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Subscription failed.");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const cols = [
    {
      title: "House",
      items: [
        { label: "Our Heritage", href: "/heritage" },
        { label: "Saree Care Guide", href: "/care-guide" },
        { label: "Journal", href: "#" },
        { label: "Ateliers", href: "#" },
      ],
    },
    {
      title: "Shop",
      items: [
        { label: "All Creations", href: "/collections" },
        { label: "The Bridal Edit", href: "/collections/bridal" },
        { label: "Festive Weaves", href: "/collections/festive" },
        { label: "Classic Everyday", href: "/collections/everyday" },
      ],
    },
    {
      title: "Care",
      items: [
        { label: "Consultation Booking", href: "/contact" },
        { label: "Shipping & Returns", href: "/shipping" },
        { label: "Orders", href: "/orders" },
        { label: "Privacy Policy", href: "#" },
      ],
    },
  ];

  return (
    <footer
      className="border-t pt-16 pb-8 px-6 sm:px-8 font-sans font-light"
      style={{
        backgroundColor: "rgba(245,243,238,0.5)", // reference bg-secondary/30
        borderColor: "var(--color-border-light)",
      }}
    >
      <div className="container-x mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-4 mb-16">
          {/* Column 1: Brand */}
          <div>
            <Link
              href="/"
              className="font-display text-2xl tracking-[0.22em] transition-colors duration-300 hover:opacity-70 w-fit block"
              style={{ color: "var(--color-ink)" }}
            >
              SAKHY
            </Link>
            <p
              className="mt-4 max-w-xs text-sm leading-relaxed"
              style={{ color: "var(--color-ink-muted)" }}
            >
              A quiet luxury saree house. Handwoven in India, for the modern
              woman.
            </p>
            <div className="mt-6 flex gap-2">
              {["Instagram", "Pinterest", "WhatsApp"].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 text-xs"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-ink)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-ink)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-background)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-light)";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-ink)";
                  }}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Columns 2-4: Navigation */}
          {cols.map((col) => (
            <div key={col.title}>
              <p
                className="mb-5 text-[11px] uppercase tracking-[0.28em] font-medium"
                style={{ color: "var(--color-ink)" }}
              >
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: "var(--color-ink-muted)" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--color-ink)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = "var(--color-ink-muted)")
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter — reference-style centered box */}
        <div
          className="mx-auto max-w-3xl rounded-xl border p-10 text-center md:p-16 mb-16"
          style={{
            backgroundColor: "var(--color-background)",
            borderColor: "var(--color-border-light)",
          }}
        >
          <p
            className="mb-4 text-[11px] uppercase tracking-[0.32em]"
            style={{ color: "var(--color-gold-ref)" }}
          >
            The Letter
          </p>
          <h2
            className="font-display text-4xl leading-tight md:text-5xl mb-4"
            style={{ color: "var(--color-ink)" }}
          >
            Stay Inspired
          </h2>
          <p
            className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed mb-8"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Be the first to discover new collections, private previews and
            occasional atelier notes.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-full px-5 py-3.5 text-sm transition-colors duration-200 focus:outline-none"
              style={{
                border: `1px solid var(--color-border-light)`,
                backgroundColor: "var(--color-background)",
                color: "var(--color-ink)",
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)")
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-light)")
              }
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full px-6 py-3.5 text-[12px] uppercase tracking-[0.18em] transition-colors duration-200 disabled:opacity-60"
              style={{
                backgroundColor: "var(--color-ink)",
                color: "var(--color-background)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(17,17,17,0.85)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-ink)")
              }
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
          {message && (
            <p
              className="text-[11px] tracking-wider mt-3 leading-relaxed"
              style={{ color: status === "error" ? "#dc2626" : "var(--color-gold-ref)" }}
            >
              {message}
            </p>
          )}
        </div>

        {/* Footer Bottom */}
        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row"
          style={{
            borderColor: "var(--color-border-light)",
            color: "var(--color-ink-muted)",
          }}
        >
          <p>© 2026 Sakhy Atelier. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">
            Handwoven in India · Shipped worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
