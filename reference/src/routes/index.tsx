import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Star,
  Eye,
  Sparkles,
  Leaf,
  Truck,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
} from "lucide-react";

import hero from "@/assets/hero.jpg";
import catSilk from "@/assets/cat-silk.jpg";
import catCotton from "@/assets/cat-cotton.jpg";
import catLinen from "@/assets/cat-linen.jpg";
import catOrganza from "@/assets/cat-organza.jpg";
import catBanarasi from "@/assets/cat-banarasi.jpg";
import catParty from "@/assets/cat-party.jpg";
import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";
import p7 from "@/assets/product-7.jpg";
import p8 from "@/assets/product-8.jpg";
import ig1 from "@/assets/ig-1.jpg";
import ig2 from "@/assets/ig-2.jpg";
import ig3 from "@/assets/ig-3.jpg";
import ig4 from "@/assets/ig-4.jpg";
import ig5 from "@/assets/ig-5.jpg";
import ig6 from "@/assets/ig-6.jpg";
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sakhy — Timeless Elegance, Woven for Every Occasion" },
      {
        name: "description",
        content:
          "Sakhy is a luxury saree house crafting handwoven silk, cotton, linen, organza and Banarasi sarees for the modern woman.",
      },
      { property: "og:title", content: "Sakhy — Handcrafted Luxury Sarees" },
      {
        property: "og:description",
        content:
          "Discover handcrafted sarees that blend tradition with contemporary style.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* -------------------- Reveal on scroll -------------------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  const Comp: any = Tag;
  return (
    <Comp
      ref={ref as any}
      style={{ animationDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/* -------------------- Nav -------------------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "Collections", "About", "Contact"];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-x mx-auto flex h-16 max-w-[1400px] items-center justify-between md:h-20">
        <a
          href="#"
          className="font-display text-2xl tracking-[0.18em] text-ink"
        >
          SAKHY
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="relative text-[13px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
            >
              {l}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <IconBtn label="Search"><Search className="h-[18px] w-[18px]" /></IconBtn>
          <IconBtn label="Wishlist"><Heart className="h-[18px] w-[18px]" /></IconBtn>
          <IconBtn label="Cart">
            <span className="relative">
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-ink">
                2
              </span>
            </span>
          </IconBtn>
          <button
            className="ml-1 rounded-full p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-x mx-auto flex flex-col py-4">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.14em] text-ink-muted"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function IconBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-full p-2.5 text-ink transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}

/* -------------------- Hero -------------------- */
function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" className="relative h-screen min-h-[680px] w-full overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${y * 0.25}px, 0)` }}
      >
        <img
          src={hero}
          alt="Woman wearing handcrafted Sakhy saree"
          width={1600}
          height={1200}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background/80" />
      </div>

      <div className="relative z-10 flex h-full items-end pb-16 md:items-center md:pb-0">
        <div className="container-x mx-auto max-w-[1400px]">
          <div className="max-w-2xl">
            <Reveal>
              <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink-muted">
                <span className="h-px w-8 bg-gold" />
                The Autumn Edit · 2026
              </p>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="font-display text-[42px] leading-[1.05] text-ink sm:text-6xl md:text-7xl">
                Timeless Elegance,
                <br />
                <span className="italic text-ink">Woven</span> for
                Every Occasion
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
                Discover handcrafted sarees that blend generations of tradition
                with a contemporary, understated luxury.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="#collection"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] text-background transition-all hover:bg-ink/85"
                >
                  Shop Collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/25 bg-background/60 px-7 py-3.5 text-[13px] uppercase tracking-[0.18em] text-ink backdrop-blur transition-all hover:border-ink hover:bg-background"
                >
                  Explore New Arrivals
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-ink-muted">
        Scroll
      </div>
    </section>
  );
}

/* -------------------- Marquee -------------------- */
function Marquee() {
  const items = [
    "Handloom Silk",
    "Pure Cotton",
    "Zari Weaves",
    "Chikankari",
    "Kanjivaram",
    "Banarasi",
    "Organza",
    "Chanderi",
  ];
  const row = [...items, ...items];
  return (
    <div className="border-y border-border bg-background py-5 overflow-hidden">
      <div className="marquee flex gap-14 whitespace-nowrap">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-14 font-display text-lg italic text-ink-muted"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------- Categories -------------------- */
const categories = [
  { name: "Silk", full: "Silk Sarees", img: catSilk, count: 42 },
  { name: "Cotton", full: "Cotton Sarees", img: catCotton, count: 36 },
  { name: "Linen", full: "Linen Sarees", img: catLinen, count: 24 },
  { name: "Organza", full: "Organza Sarees", img: catOrganza, count: 18 },
  { name: "Banarasi", full: "Banarasi Sarees", img: catBanarasi, count: 30 },
  { name: "Party Wear", full: "Party Wear", img: catParty, count: 27 },
];

function Categories() {
  return (
    <section id="categories" className="container-x mx-auto max-w-[1400px] py-24 md:py-32">
      <div className="mb-14 flex items-end justify-between gap-8">
        <div>
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink-muted">
              <span className="h-px w-8 bg-gold" />
              Curated by Fabric
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="max-w-xl font-display text-4xl leading-tight md:text-5xl">
              A wardrobe for every quiet ceremony.
            </h2>
          </Reveal>
        </div>
        <a
          href="#"
          className="hidden text-[12px] uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink md:inline-flex md:items-center md:gap-2"
        >
          View all <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.name} delay={i * 60}>
            <a
              href="#"
              className="group relative block overflow-hidden rounded-xl bg-secondary aspect-[4/5]"
            >
              <img
                src={c.img}
                alt={c.full}
                width={800}
                height={1000}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] opacity-80">
                      {c.count} pieces
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-background">
                      {c.full}
                    </h3>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-background/40 transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Collection -------------------- */
const products = [
  { name: "Ivory Chikankari", price: 24800, rating: 5, img: p4, tag: "New" },
  { name: "Emerald Kanjivaram", price: 42500, rating: 5, img: p3, tag: "" },
  { name: "Rose Petal Silk", price: 18900, rating: 4, img: p2, tag: "" },
  { name: "Maroon Banarasi", price: 38200, rating: 5, img: p5, tag: "Bestseller" },
  { name: "Golden Zari Weave", price: 32400, rating: 5, img: p1, tag: "" },
  { name: "Azure Chiffon", price: 15600, rating: 4, img: p6, tag: "" },
  { name: "Terracotta Linen", price: 12800, rating: 4, img: p7, tag: "New" },
  { name: "Midnight Sequin", price: 46900, rating: 5, img: p8, tag: "Limited" },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < n ? "fill-gold text-gold" : "text-border"
          }`}
        />
      ))}
    </div>
  );
}

function Collection() {
  return (
    <section id="collection" className="bg-secondary/40 py-24 md:py-32">
      <div className="container-x mx-auto max-w-[1400px]">
        <div className="mb-14 text-center">
          <Reveal>
            <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-ink-muted">
              Featured Collection
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight md:text-5xl">
              The season's most quietly beautiful weaves.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.name} delay={i * 40}>
              <article className="group">
                <div className="relative overflow-hidden rounded-xl bg-background aspect-[4/5]">
                  <img
                    src={p.img}
                    alt={p.name}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="h-full w-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink backdrop-blur">
                      {p.tag}
                    </span>
                  )}
                  <button
                    aria-label="Wishlist"
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/95 text-ink backdrop-blur transition-colors hover:text-gold"
                  >
                    <Heart className="h-4 w-4" />
                  </button>

                  <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-full bg-ink py-2.5 text-[11px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-ink/85">
                        Add to Cart
                      </button>
                      <button
                        aria-label="Quick view"
                        className="grid h-10 w-10 place-items-center rounded-full bg-background text-ink transition-colors hover:bg-gold"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <Stars n={p.rating} />
                  <h3 className="font-display text-lg leading-snug text-ink">
                    {p.name}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    ₹ {p.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-ink/25 px-7 py-3.5 text-[12px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-background"
          >
            View the full collection <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Why Choose -------------------- */
const values = [
  {
    icon: Sparkles,
    title: "Handcrafted Quality",
    body: "Every drape is finished by master weavers whose craft is passed down through generations.",
  },
  {
    icon: Leaf,
    title: "Authentic Fabrics",
    body: "Traceable silks, pure cottons and hand-loomed linens sourced from India's finest looms.",
  },
  {
    icon: Truck,
    title: "Complimentary Delivery",
    body: "Free shipping across India, discreet packaging and easy returns within 14 days.",
  },
];

function Why() {
  return (
    <section id="about" className="container-x mx-auto max-w-[1400px] py-24 md:py-32">
      <div className="grid gap-16 md:grid-cols-3 md:gap-10">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 100}>
            <div className="flex flex-col items-start">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
                <v.icon className="h-6 w-6" strokeWidth={1.4} />
              </div>
              <h3 className="mt-6 font-display text-2xl text-ink">{v.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">
                {v.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Testimonials -------------------- */
const testimonials = [
  {
    name: "Ananya R.",
    city: "Mumbai",
    img: t2,
    quote:
      "The craftsmanship is unlike anything I've owned. The weave, the fall, the finish — every detail feels considered.",
  },
  {
    name: "Priya S.",
    city: "Bengaluru",
    img: t1,
    quote:
      "My Sakhy Banarasi is now the heirloom I never inherited. It felt like slipping into a piece of poetry.",
  },
  {
    name: "Meera K.",
    city: "Chennai",
    img: t3,
    quote:
      "Modern, quiet, and deeply Indian. This is the saree brand I've been waiting for.",
  },
];

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, []);
  const c = testimonials[i];
  return (
    <section className="bg-secondary/40 py-24 md:py-32">
      <div className="container-x mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="mb-8 text-[11px] uppercase tracking-[0.32em] text-ink-muted">
            Kind Words
          </p>
        </Reveal>
        <div key={i} className="reveal">
          <blockquote className="mx-auto font-display text-2xl italic leading-snug text-ink md:text-4xl">
            &ldquo;{c.quote}&rdquo;
          </blockquote>
          <div className="mt-10 flex flex-col items-center gap-3">
            <img
              src={c.img}
              alt={c.name}
              width={512}
              height={512}
              loading="lazy"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
                {c.city}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Testimonial ${idx + 1}`}
              className={`h-1 rounded-full transition-all ${
                idx === i ? "w-8 bg-ink" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Instagram -------------------- */
function Gallery() {
  const imgs = [ig1, ig2, ig3, ig4, ig5, ig6];
  return (
    <section className="container-x mx-auto max-w-[1400px] py-24 md:py-32">
      <div className="mb-12 flex flex-col items-center gap-3 text-center">
        <Reveal>
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink-muted">
            <Instagram className="h-4 w-4 text-gold" />
            @sakhy.atelier
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Draped, in the world.
          </h2>
        </Reveal>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-6">
        {imgs.map((src, i) => (
          <a
            key={i}
            href="#"
            className="group relative block overflow-hidden rounded-xl aspect-square"
          >
            <img
              src={src}
              alt={`Sakhy lifestyle ${i + 1}`}
              width={700}
              height={700}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-background" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* -------------------- Newsletter -------------------- */
function Newsletter() {
  return (
    <section id="contact" className="container-x mx-auto max-w-[1400px] pb-24 md:pb-32">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-background p-10 text-center md:p-16">
        <Reveal>
          <p className="mb-4 text-[11px] uppercase tracking-[0.32em] text-gold">
            The Letter
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Stay Inspired
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Be the first to discover new collections, private previews and
            occasional atelier notes.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.18em] text-background transition-colors hover:bg-ink/85"
            >
              Subscribe
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------- Footer -------------------- */
function Footer() {
  const cols = [
    { title: "House", items: ["About", "Craftsmanship", "Journal", "Ateliers"] },
    { title: "Shop", items: ["New Arrivals", "Silk", "Cotton", "Banarasi", "Party Wear"] },
    { title: "Care", items: ["Contact", "Shipping Policy", "Returns", "Size Guide", "Privacy Policy"] },
  ];
  return (
    <footer className="border-t border-border bg-secondary/30 pt-16 pb-8">
      <div className="container-x mx-auto max-w-[1400px]">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-display text-2xl tracking-[0.18em] text-ink">
              SAKHY
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              A quiet luxury saree house. Handwoven in India, for the modern
              woman.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Facebook, Twitter].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink transition-colors hover:border-ink hover:bg-ink hover:text-background"
                >
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-ink">
                {c.title}
              </p>
              <ul className="space-y-3">
                {c.items.map((x) => (
                  <li key={x}>
                    <a
                      href="#"
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {x}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-ink-muted md:flex-row">
          <p>© 2026 Sakhy Atelier. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase">
            Handwoven in India · Shipped worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------- Page -------------------- */
function Landing() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Categories />
        <Collection />
        <Why />
        <Testimonials />
        <Gallery />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
