"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Search, Heart, ShoppingBag, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Collections", href: "/collections" },
  { name: "Heritage", href: "/heritage" },
  { name: "Care Guide", href: "/care-guide" },
  { name: "Orders", href: "/orders" },
  { name: "Contact", href: "/contact" },
];

/**
 * Reference-styled Navbar:
 * - Logo left-aligned (desktop center is reference pattern; here we keep
 *   the same functional layout but match the reference's visual style)
 * - Nav links with underline-on-hover gold accent
 * - Icon buttons with rounded-full hover pill
 * - Scroll: transparent → backdrop-blur warm bg
 * - All functional cart/routing logic preserved unchanged
 */
export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomepage = pathname === "/";
  // Over a dark hero on homepage before scroll
  const heroMode = isHomepage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <style>{`
        .nav-link-underline {
          position: relative;
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          height: 1px;
          width: 0;
          background-color: var(--color-gold-ref);
          transition: width 0.3s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.active::after {
          width: 100%;
        }
      `}</style>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ivory/90 backdrop-blur-md border-b py-3 shadow-sm"
            : heroMode
            ? "bg-transparent py-6"
            : "bg-ivory/95 backdrop-blur-sm border-b py-3"
        }`}
        style={{ borderColor: scrolled || !heroMode ? "var(--color-border-light)" : "transparent" }}
      >
        <div className="container-x mx-auto flex h-14 max-w-[1400px] items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl tracking-[0.22em] transition-colors duration-300 hover:opacity-80"
            style={{ color: heroMode ? "var(--color-ivory)" : "var(--color-ink)" }}
          >
            SAKHY
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.slice(0, 3).map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link-underline text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    active ? "active" : ""
                  }`}
                  style={{
                    color: heroMode
                      ? active
                        ? "var(--color-gold-ref)"
                        : "rgba(245,239,233,0.85)"
                      : active
                      ? "var(--color-gold-ref)"
                      : "var(--color-ink-muted)",
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right: remaining links + action icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.slice(3).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`nav-link-underline text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                      active ? "active" : ""
                    }`}
                    style={{
                      color: heroMode
                        ? active
                          ? "var(--color-gold-ref)"
                          : "rgba(245,239,233,0.85)"
                        : active
                        ? "var(--color-gold-ref)"
                        : "var(--color-ink-muted)",
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Icon buttons — reference style: rounded-full, hover bg-secondary */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <Link
                href="/collections"
                aria-label="Search"
                className="rounded-full p-2.5 transition-colors duration-200"
                style={{
                  color: heroMode ? "rgba(245,239,233,0.9)" : "var(--color-ink)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,239,233,0.12)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                }
              >
                <Search className="h-[18px] w-[18px]" />
              </Link>

              <button
                aria-label="Wishlist"
                className="rounded-full p-2.5 transition-colors duration-200"
                style={{
                  color: heroMode ? "rgba(245,239,233,0.9)" : "var(--color-ink)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = heroMode ? "rgba(245,239,233,0.12)" : "var(--color-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                }
              >
                <Heart className="h-[18px] w-[18px]" />
              </button>

              {/* Cart Button — reference style with count badge */}
              <button
                type="button"
                onClick={toggleCart}
                aria-label="Shopping cart"
                className="rounded-full p-2.5 transition-colors duration-200 relative"
                style={{
                  color: heroMode ? "rgba(245,239,233,0.9)" : "var(--color-ink)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = heroMode ? "rgba(245,239,233,0.12)" : "var(--color-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                }
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {cartCount > 0 && (
                  <span
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: "var(--color-gold-ref)",
                      color: "var(--color-ink)",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="ml-1 rounded-full p-2.5 md:hidden transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                style={{
                  color: heroMode ? "rgba(245,239,233,0.9)" : "var(--color-ink)",
                  backgroundColor: "transparent",
                }}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer — reference style: full-width white panel */}
        {mobileMenuOpen && (
          <div
            className="border-t md:hidden"
            style={{
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border-light)",
            }}
          >
            <div className="container-x mx-auto flex flex-col py-4">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3.5 text-[12px] uppercase tracking-[0.2em] transition-colors duration-200 border-b"
                    style={{
                      color: active ? "var(--color-gold-ref)" : "var(--color-ink-muted)",
                      borderColor: "var(--color-border-light)",
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
