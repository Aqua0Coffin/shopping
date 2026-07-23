import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import Marquee from "@/components/motion/Marquee";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TestimonialCarousel from "@/components/motion/TestimonialCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import HomeHeroSection from "@/components/storefront/HomeHeroSection";

// Revalidate home page every 60 seconds
export const revalidate = 60;

const processSteps = [
  {
    num: "01",
    title: "Thread Selection",
    desc: "Pure mulberry silk threads are tested for tensile strength and hand-dyed in organic vats.",
  },
  {
    num: "02",
    title: "Zari Verification",
    desc: "Every inch of gold and silver zari thread is authenticated for metal purity before warping.",
  },
  {
    num: "03",
    title: "Hand Looming",
    desc: "Two master weavers synchronize hand and foot movements on traditional wooden pit looms.",
  },
  {
    num: "04",
    title: "The Blessing",
    desc: "Each completed saree is steam-pressed and blessed by the artisan community before cataloging.",
  },
];

const values = [
  {
    emoji: "✦",
    title: "Handcrafted Quality",
    body: "Every drape is finished by master weavers whose craft is passed down through generations.",
  },
  {
    emoji: "❧",
    title: "Authentic Fabrics",
    body: "Traceable silks, pure cottons and hand-loomed linens sourced from India's finest looms.",
  },
  {
    emoji: "◎",
    title: "Complimentary Delivery",
    body: "Free shipping across India, discreet packaging and easy returns within 14 days.",
  },
];

export default async function HomePage() {
  // Fetch dynamic content — same queries as before, fully preserved
  const [categories, featuredProducts, weaveTypes, dbTestimonials, siteSettings] =
    await Promise.all([
      prisma.category.findMany({
        include: {
          products: {
            where: { status: "published" },
            take: 1,
            include: { variants: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { status: "published" },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            take: 1,
          },
        },
      }),
      prisma.product.findMany({
        where: { status: "published" },
        select: { fabricType: true },
        distinct: ["fabricType"],
      }),
      prisma.testimonial.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
      }),
      getSiteSettings(),
    ]);

  const weavesList =
    weaveTypes.length > 0
      ? weaveTypes.map((w) => w.fabricType)
      : ["Handloom Silk", "Pure Cotton", "Zari Weaves", "Chikankari", "Kanjivaram", "Banarasi", "Organza", "Chanderi"];

  const testimonials = dbTestimonials.map((t) => ({
    id: t.id,
    rating: 5,
    text: t.quote,
    author: t.customerName,
    location: t.location,
  }));

  // Hero copy from DB — preserved exactly as before
  const heroSupertitle = siteSettings.hero_supertitle;
  const headlineParts = siteSettings.hero_headline.split(" & ");
  const headlineMain = headlineParts[0] ?? siteSettings.hero_headline;
  const headlineAccent = headlineParts.length > 1 ? headlineParts.slice(1).join(" & ") : null;
  const heroSubheadline = siteSettings.hero_subheadline;
  const ctaPrimary = siteSettings.hero_cta_primary || "Explore Collections";
  const ctaSecondary = siteSettings.hero_cta_secondary || "Our Heritage";

  return (
    <div style={{ backgroundColor: "var(--color-background)" }} className="overflow-hidden">

      {/* ── SECTION 1: HERO — reference-style image with parallax ── */}
      {/*
        HomeHeroSection is a client component that handles:
        - scroll parallax
        - scroll-triggered reveal animations
        All DB-fetched hero copy is passed as props (server → client boundary)
      */}
      <HomeHeroSection
        heroSupertitle={heroSupertitle}
        headlineMain={headlineMain}
        headlineAccent={headlineAccent}
        heroSubheadline={heroSubheadline}
        ctaPrimary={ctaPrimary}
        ctaSecondary={ctaSecondary}
      />

      {/* ── SECTION 2: MARQUEE STRIP — reference light style ── */}
      <div
        className="border-y overflow-hidden py-5"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border-light)",
        }}
      >
        <Marquee items={weavesList} speed={40} separator="•" theme="light" className="" />
      </div>

      {/* ── SECTION 3: CATEGORIES GRID — reference rounded-xl cards ── */}
      <section
        id="categories"
        className="container-x mx-auto max-w-[1400px] py-24 md:py-32"
      >
        <div className="mb-14 flex items-end justify-between gap-8">
          <div>
            <ScrollReveal direction="up">
              <p
                className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <span
                  className="h-px w-8 inline-block"
                  style={{ backgroundColor: "var(--color-gold-ref)" }}
                />
                Curated by Fabric
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <h2
                className="max-w-xl font-display text-4xl leading-tight md:text-5xl font-light"
                style={{ color: "var(--color-ink)" }}
              >
                A wardrobe for every quiet ceremony.
              </h2>
            </ScrollReveal>
          </div>
          <Link
            href="/collections"
            className="hidden text-[12px] uppercase tracking-[0.18em] transition-colors md:inline-flex md:items-center md:gap-2"
            style={{ color: "var(--color-ink-muted)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--color-ink)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--color-ink-muted)")
            }
          >
            View all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 ? (
            categories.map((category, idx) => {
              const firstProduct = category.products[0];
              const image = firstProduct?.variants[0]?.images?.[0];

              return (
                <ScrollReveal key={category.id} direction="up" delay={idx * 0.06}>
                  <Link
                    href={`/collections/${category.slug}`}
                    className="group relative block overflow-hidden rounded-xl aspect-[4/5]"
                    style={{ backgroundColor: "var(--color-secondary)" }}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={category.name}
                        fill
                        className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: "linear-gradient(135deg, rgba(232,220,200,0.3) 0%, rgba(232,220,200,0.7) 100%)",
                        }}
                      >
                        <div
                          className="absolute inset-4 border pointer-events-none"
                          style={{ borderColor: "rgba(201,166,107,0.1)" }}
                        />
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage: "radial-gradient(circle, var(--color-gold-ref) 1px, transparent 1px)",
                            backgroundSize: "12px 12px",
                          }}
                        />
                      </div>
                    )}

                    {/* Gradient overlay — from-ink/55 matching reference */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(to top, rgba(17,17,17,0.55) 0%, transparent 60%)",
                      }}
                    />

                    {/* Text + arrow */}
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] opacity-80">
                            {category.products.length} pieces
                          </p>
                          <h3 className="mt-1 font-display text-2xl text-white font-light">
                            {category.name}
                          </h3>
                        </div>
                        {/* Arrow circle — reference cat-arrow style */}
                        <span
                          className="grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 flex-shrink-0"
                          style={{
                            borderColor: "rgba(255,255,255,0.4)",
                            color: "white",
                          }}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })
          ) : (
            // Fallback placeholder categories when DB is empty
            [
              { name: "Silk Sarees", count: 42 },
              { name: "Cotton Sarees", count: 36 },
              { name: "Linen Sarees", count: 24 },
              { name: "Organza Sarees", count: 18 },
              { name: "Banarasi Sarees", count: 30 },
              { name: "Party Wear", count: 27 },
            ].map((cat, idx) => (
              <ScrollReveal key={cat.name} direction="up" delay={idx * 0.06}>
                <Link
                  href="/collections"
                  className="group relative block overflow-hidden rounded-xl aspect-[4/5]"
                  style={{
                    background: "linear-gradient(135deg, rgba(232,220,200,0.4) 0%, rgba(176,141,94,0.25) 100%)",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(17,17,17,0.55) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.28em] opacity-80">{cat.count} pieces</p>
                        <h3 className="mt-1 font-display text-2xl font-light">{cat.name}</h3>
                      </div>
                      <span
                        className="grid h-10 w-10 place-items-center rounded-full border flex-shrink-0"
                        style={{ borderColor: "rgba(255,255,255,0.4)" }}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))
          )}
        </div>
      </section>

      {/* ── SECTION 4: FEATURED PRODUCTS — reference collection grid ── */}
      <section
        id="products"
        className="py-24 md:py-32"
        style={{ backgroundColor: "rgba(245,243,238,0.4)" }}
      >
        <div className="container-x mx-auto max-w-[1400px]">
          <div className="mb-14 text-center">
            <ScrollReveal direction="up">
              <p
                className="mb-4 text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Featured Collection
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <h2
                className="mx-auto max-w-2xl font-display text-4xl leading-tight md:text-5xl font-light"
                style={{ color: "var(--color-ink)" }}
              >
                The season&apos;s most quietly beautiful weaves.
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
            {featuredProducts.map((product, idx) => (
              <ScrollReveal key={product.id} direction="up" delay={idx * 0.04}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <ScrollReveal direction="up">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[12px] uppercase tracking-[0.18em] transition-colors duration-300"
                style={{
                  border: "1px solid rgba(17,17,17,0.25)",
                  color: "var(--color-ink)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-ink)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-ink)";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-background)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,17,17,0.25)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-ink)";
                }}
              >
                View the full collection
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: WHY CHOOSE — reference 3-icon values section ── */}
      <section className="container-x mx-auto max-w-[1400px] py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-3 md:gap-10">
          {values.map((v, i) => (
            <ScrollReveal key={v.title} direction="up" delay={i * 0.1}>
              <div className="flex flex-col items-start">
                <div
                  className="grid h-14 w-14 place-items-center rounded-full border text-xl"
                  style={{
                    borderColor: "rgba(201,166,107,0.4)",
                    color: "var(--color-gold-ref)",
                  }}
                >
                  {v.emoji}
                </div>
                <h3
                  className="mt-6 font-display text-2xl"
                  style={{ color: "var(--color-ink)" }}
                >
                  {v.title}
                </h3>
                <p
                  className="mt-3 max-w-sm text-[15px] leading-relaxed"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {v.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: HERITAGE QUOTE STRIP (preserved from target) ── */}
      <section
        className="py-24 text-white relative border-y overflow-hidden"
        style={{
          backgroundColor: "var(--color-deep)",
          borderColor: "rgba(201,166,107,0.15)",
        }}
      >
        <div
          className="absolute inset-0 flex items-center pointer-events-none opacity-[0.02] select-none"
        >
          <div
            className="font-display text-[150px] uppercase font-semibold tracking-[0.2em] whitespace-nowrap animate-heritage-drift"
            style={{ color: "var(--color-gold)" }}
          >
            SAKHY HERITAGE SAKHY HERITAGE SAKHY HERITAGE SAKHY HERITAGE
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center flex flex-col items-center container-x">
          <ScrollReveal direction="up">
            <span
              className="text-[10px] tracking-[0.4em] uppercase mb-8 block"
              style={{ color: "var(--color-gold-ref)" }}
            >
              62 Years of Preservation
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <p
              className="font-display text-2xl sm:text-3xl italic font-light leading-relaxed max-w-3xl mb-8"
              style={{ color: "rgba(245,239,233,0.8)" }}
            >
              &ldquo;A saree is not merely six yards of silk. It is a canvas of mathematical precision,
              agricultural devotion, and spiritual handcrafting.&rdquo;
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <span
              className="font-sans text-[10px] tracking-[0.25em] uppercase"
              style={{ color: "var(--color-gold-ref)" }}
            >
              — The Weavers of Kanchipuram
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SECTION 7: STATS BAR (preserved) ── */}
      <section
        className="py-12 border-b"
        style={{
          backgroundColor: "rgba(232,220,200,0.25)",
          borderColor: "rgba(201,166,107,0.1)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Sarees Handwoven", val: "10K+" },
            { label: "Artisan Weavers", val: "200+" },
            { label: "Weaving Hubs", val: "28" },
            { label: "Legacy Years", val: "62" },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 0.1}>
              <div className="flex flex-col gap-1.5">
                <span
                  className="font-display text-3xl font-light"
                  style={{ color: "var(--color-gold-ref)" }}
                >
                  {stat.val}
                </span>
                <span
                  className="text-[9px] font-sans tracking-[0.2em] uppercase font-light"
                  style={{ color: "var(--color-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 8: TESTIMONIALS — reference-style centered auto-rotate ── */}
      {testimonials.length > 0 && (
        <section
          className="py-24 md:py-32"
          style={{ backgroundColor: "rgba(245,243,238,0.4)" }}
        >
          <div className="container-x mx-auto max-w-4xl text-center">
            <ScrollReveal direction="up">
              <p
                className="mb-8 text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Kind Words
              </p>
            </ScrollReveal>
          </div>
          <div className="container-x mx-auto max-w-7xl">
            <TestimonialCarousel testimonials={testimonials} speed={36} />
          </div>
        </section>
      )}

      {/* ── SECTION 9: PROCESS STEPS (preserved) ── */}
      <section
        id="process"
        className="py-24 px-6 sm:px-8 max-w-[1400px] mx-auto border-b"
        style={{ borderColor: "rgba(201,166,107,0.1)" }}
      >
        <ScrollReveal direction="up">
          <SectionHeading tag="Artisan Journey" title="Path of the *Six Yards*" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, idx) => (
            <ScrollReveal key={step.num} direction="up" delay={idx * 0.1}>
              <div className="flex flex-col gap-4 relative">
                <span
                  className="font-display text-5xl font-light"
                  style={{ color: "rgba(201,166,107,0.25)" }}
                >
                  {step.num}
                </span>
                <h3
                  className="font-display text-lg font-normal"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--color-muted)" }}
                >
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 10: WEAVES SHOWCASE (preserved) ── */}
      <section
        id="weaves"
        className="py-24 border-y text-white"
        style={{
          backgroundColor: "var(--color-deep)",
          borderColor: "rgba(201,166,107,0.15)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16 flex flex-col items-center">
              <span
                className="text-[10px] tracking-[0.4em] uppercase mb-4 block font-sans font-light"
                style={{ color: "var(--color-gold-ref)" }}
              >
                Regional Hubs
              </span>
              <h2
                className="font-display text-4xl font-light leading-snug"
                style={{ color: "white" }}
              >
                Chronicles of the Loom
              </h2>
              <div
                className="w-12 h-[1px] mt-5"
                style={{ backgroundColor: "rgba(201,166,107,0.45)" }}
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { hub: "Kanchipuram", tag: "Tamil Nadu", text: "Heavy zari work, solid borders, temple contrast motifs." },
              { hub: "Banaras", tag: "Uttar Pradesh", text: "Pure gold brocade, fine Mughal motifs, heavy sheer silk." },
              { hub: "Yeola", tag: "Maharashtra", text: "Vibrant silk, peacock borders, hand-locked pallu tapestries." },
              { hub: "Chanderi", tag: "Madhya Pradesh", text: "Light sheer weaves, cotton-silk mix, subtle golden bootis." },
            ].map((weave, idx) => (
              <ScrollReveal key={weave.hub} direction="up" delay={idx * 0.1}>
                <div
                  className="border p-6 transition-colors duration-500 h-full flex flex-col"
                  style={{
                    borderColor: "rgba(201,166,107,0.15)",
                    backgroundColor: "rgba(44,36,22,0.2)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "rgba(201,166,107,0.4)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor = "rgba(201,166,107,0.15)")
                  }
                >
                  <span
                    className="font-display text-lg mb-1 block"
                    style={{ color: "var(--color-gold-ref)" }}
                  >
                    {weave.hub}
                  </span>
                  <span
                    className="text-[8px] font-sans tracking-widest uppercase mb-4 block"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {weave.tag}
                  </span>
                  <p
                    className="text-[11px] font-sans font-light tracking-wide leading-relaxed mt-auto"
                    style={{ color: "rgba(245,239,233,0.5)" }}
                  >
                    {weave.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
