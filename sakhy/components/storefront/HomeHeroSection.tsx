"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomeHeroSectionProps {
  heroSupertitle: string;
  headlineMain: string;
  headlineAccent: string | null;
  heroSubheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

/**
 * HomeHeroSection — Reference-style hero section.
 *
 * Visual features from REFERENCE:
 * - Full-viewport light-on-dark image with parallax scroll (y * 0.25)
 * - Gradient overlay from-background/40 via-background/10 to-background/80
 * - Scroll-triggered reveal animations (IntersectionObserver)
 * - "Scroll" indicator at bottom center
 * - CTA buttons: dark pill + outline pill (reference pattern)
 *
 * All hero copy is passed as props from the server component so that
 * the DB-fetched siteSettings remain server-side (no functionality change).
 */
export default function HomeHeroSection({
  heroSupertitle,
  headlineMain,
  headlineAccent,
  heroSubheadline,
  ctaPrimary,
  ctaSecondary,
}: HomeHeroSectionProps) {
  const [y, setY] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trigger reveal on mount (slight delay for entrance effect)
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  const revealStyle = (delay: number): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  });

  return (
    <section
      id="home"
      className="relative h-screen min-h-[680px] w-full overflow-hidden"
    >
      {/* Parallax image layer */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${y * 0.25}px, 0)` }}
      >
        {/* Decorative gradient background (shown when no image, or as a pattern)
            Matches reference: warm off-white with radial gradient effect */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 70% 30%, rgba(201,166,107,0.18) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 70%, rgba(139,26,26,0.06) 0%, transparent 50%),
              linear-gradient(160deg, var(--color-charcoal) 0%, var(--color-deep) 100%)
            `,
          }}
        />
        {/* Fine grid overlay — reference's subtle gold line pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, var(--color-gold-ref) 1px, transparent 1px), linear-gradient(-45deg, var(--color-gold-ref) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Ambient glow */}
        <div
          className="absolute rounded-full"
          style={{
            top: "20%",
            right: "10%",
            width: 450,
            height: 450,
            background: "radial-gradient(circle, rgba(201,166,107,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Gradient overlay — reference: from-background/40 via-background/10 to-background/80 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245,239,233,0.15) 0%, rgba(245,239,233,0.04) 40%, rgba(245,239,233,0.55) 100%)",
          }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex h-full items-end pb-16 md:items-center md:pb-0">
        <div className="container-x mx-auto max-w-[1400px]">
          <div className="max-w-2xl">
            {/* Supertitle */}
            <div style={revealStyle(0)}>
              <p
                className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "rgba(201,166,107,0.9)" }}
              >
                <span
                  className="h-px w-8 inline-block"
                  style={{ backgroundColor: "var(--color-gold-ref)" }}
                />
                {heroSupertitle || "The Heritage Edit · 2026"}
              </p>
            </div>

            {/* Headline */}
            <div style={revealStyle(120)}>
              <h1
                className="font-display text-[42px] leading-[1.05] sm:text-6xl md:text-7xl font-light"
                style={{ color: "var(--color-ivory)" }}
              >
                {headlineAccent ? (
                  <>
                    {headlineMain} &{" "}
                    <br />
                    <em
                      className="not-italic font-normal italic"
                      style={{ color: "var(--color-ivory)" }}
                    >
                      {headlineAccent}
                    </em>
                  </>
                ) : (
                  headlineMain || (
                    <>
                      Timeless Elegance,
                      <br />
                      <em className="not-italic font-normal italic">Woven</em>{" "}
                      for Every Occasion
                    </>
                  )
                )}
              </h1>
            </div>

            {/* Subheadline */}
            <div style={revealStyle(220)}>
              <p
                className="mt-6 max-w-xl text-base leading-relaxed md:text-lg"
                style={{ color: "rgba(245,239,233,0.75)" }}
              >
                {heroSubheadline ||
                  "Discover handcrafted sarees that blend generations of tradition with a contemporary, understated luxury."}
              </p>
            </div>

            {/* CTA buttons — reference pill style */}
            <div style={revealStyle(320)}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/collections"
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] transition-all duration-300"
                  style={{
                    backgroundColor: "var(--color-ivory)",
                    color: "var(--color-ink)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "0.85")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.opacity = "1")
                  }
                >
                  {ctaPrimary || "Shop Collection"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/heritage"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] transition-all duration-300 backdrop-blur-sm"
                  style={{
                    border: "1px solid rgba(245,239,233,0.3)",
                    backgroundColor: "rgba(245,239,233,0.08)",
                    color: "var(--color-ivory)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,239,233,0.7)";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,239,233,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,239,233,0.3)";
                    (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(245,239,233,0.08)";
                  }}
                >
                  {ctaSecondary || "Explore New Arrivals"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — reference pattern */}
      <div
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em]"
        style={{ color: "rgba(245,239,233,0.5)" }}
      >
        Scroll
      </div>
    </section>
  );
}
