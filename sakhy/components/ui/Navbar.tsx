"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { name: "Collections", href: "/collections" },
  { name: "Heritage", href: "/heritage" },
  { name: "Care Guide", href: "/care-guide" },
  { name: "Orders", href: "/orders" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);


  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out border-b ${
          scrolled
            ? "bg-ivory/90 backdrop-blur-md py-4 border-gold/15 shadow-sm"
            : "bg-transparent py-7 border-gold/0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <button type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden flex-col gap-1.5 justify-center items-center w-6 h-6 text-charcoal hover:text-gold transition-colors duration-300 focus:outline-none cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`w-5 h-[1px] bg-current transition-transform duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`w-5 h-[1px] bg-current transition-opacity duration-300 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-5 h-[1px] bg-current transition-transform duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-sans uppercase tracking-[0.25em] text-charcoal/80">
            {navLinks.slice(0, 3).map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`hover:text-gold transition-colors duration-300 relative py-1 ${
                    active ? "text-gold font-normal" : "font-light"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Logo (Centered) */}
          <Link
            href="/"
            className="font-display text-2xl sm:text-3xl font-light tracking-[0.3em] text-charcoal hover:text-gold transition-colors duration-500 transform hover:scale-[1.01]"
          >
            SAKHY
          </Link>

          {/* Nav Links + Actions (Desktop Right) */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="hidden md:flex items-center gap-8 text-[11px] font-sans uppercase tracking-[0.25em] text-charcoal/80">
              {navLinks.slice(3).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`hover:text-gold transition-colors duration-300 relative py-1 ${
                      active ? "text-gold font-normal" : "font-light"
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Cart Button */}
            <button type="button"
              onClick={toggleCart}
              className="flex items-center gap-2 text-charcoal hover:text-gold transition-colors duration-300 focus:outline-none relative group cursor-pointer"
              aria-label="Shopping cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
                stroke="currentColor"
                className="w-[19px] h-[19px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span className="text-[10px] tracking-wider font-sans font-light uppercase hidden sm:inline-block">
                Bag
              </span>

              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-crimson text-ivory text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans font-medium scale-95 animate-fade-in border border-ivory">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-45 bg-deep/45 backdrop-blur-sm md:hidden animate-fade-in" />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 left-0 w-4/5 max-w-sm h-screen bg-ivory z-50 border-r border-gold/15 p-10 flex flex-col justify-between transition-transform duration-500 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-12 mt-12">
          <Link
            href="/"
            className="font-display text-2xl tracking-[0.25em] text-charcoal border-b border-gold/10 pb-4 block"
          >
            SAKHY
          </Link>
          <div className="flex flex-col gap-6 text-sm font-sans uppercase tracking-[0.25em] text-charcoal">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`hover:text-gold transition-colors duration-300 py-1 ${
                    active ? "text-gold font-normal" : "font-light text-charcoal/70"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gold/10 pt-6">
          <span className="text-[9px] font-sans font-light tracking-[0.3em] uppercase text-muted block mb-2">
            Heritage-Saree Brand
          </span>
          <span className="text-[9px] font-sans font-light tracking-[0.2em] text-muted/65 block">
            © 2026 Sakhy. All rights reserved.
          </span>
        </div>
      </div>
    </>
  );
}
