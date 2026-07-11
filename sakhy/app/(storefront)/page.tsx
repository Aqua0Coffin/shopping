import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Marquee from "@/components/motion/Marquee";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TestimonialCarousel from "@/components/motion/TestimonialCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";

// Revalidate home page every 60 seconds to reflect product/inventory/testimonial updates
export const revalidate = 60;

export default async function HomePage() {
  // Fetch dynamic content from local PostgreSQL DB
  const [categories, featuredProducts, weaveTypes, dbTestimonials] = await Promise.all([
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
      take: 4,
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
  ]);

  // Fallback items in case of empty records
  const weavesList = weaveTypes.length > 0
    ? weaveTypes.map((w) => w.fabricType)
    : ["Kanjivaram Silk", "Banarasi Brocade", "Chanderi Cotton", "Paithani Weave"];

  const testimonials = dbTestimonials.map((t) => ({
    id: t.id,
    rating: 5,
    text: t.quote,
    author: t.customerName,
    location: t.location,
  }));

  // Visual/Motion process steps from index.html
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

  return (
    <div className="bg-ivory overflow-hidden">
      {/* ── SECTION 1: HERO ── */}
      <header className="relative h-screen min-h-[650px] flex items-center bg-deep text-ivory">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal via-deep to-deep" />
        {/* Fine gold lines overlay */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,var(--color-gold)_1px,transparent_1px),_linear-gradient(-45deg,var(--color-gold)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-gold/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-crimson/5 blur-[90px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full py-20 flex flex-col justify-center">
          <div className="max-w-3xl">
            <ScrollReveal direction="up" delay={0.2}>
              <span className="text-gold text-[10px] sm:text-xs tracking-[0.5em] uppercase mb-6 block font-sans font-light">
                Preserving Heritage, Weave by Weave
              </span>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-light leading-[1.1] text-ivory mb-8">
                Draped in <br />
                <em className="text-gold not-italic font-accent font-normal italic pr-2">Legacy & Grace</em>
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.6}>
              <p className="text-sm tracking-wide text-ivory/60 leading-relaxed max-w-md mb-12 font-sans font-light">
                Hand-woven masterpieces born from generational knowledge. Explore authentic silks crafted by India&apos;s finest weavers.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.8}>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <Button variant="primary" size="lg" href="/collections">
                  Explore Collections
                </Button>
                <Button variant="outline" size="lg" href="/heritage" className="!text-ivory !border-ivory/30 hover:!border-gold hover:!text-gold">
                  Our Heritage
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </header>

      {/* ── SECTION 2: INFINITE MARQUEE STRIP ── */}
      <section className="bg-deep py-4.5 border-y border-gold/15 relative z-20">
        <Marquee items={weavesList} speed={28} />
      </section>

      {/* ── SECTION 3: COLLECTIONS GRID ── */}
      <section id="collections" className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <SectionHeading tag="Heritage Collections" title="Woven for *Memorable Moments*" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, idx) => {
            const firstProduct = category.products[0];
            const image = firstProduct?.variants[0]?.images?.[0];

            return (
              <ScrollReveal key={category.id} direction="up" delay={idx * 0.15}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="group relative flex flex-col justify-end aspect-[4/5] bg-silk/40 overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_12px_24px_-10px_rgba(201,168,76,0.1)]"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-silk/30 to-silk/70 flex items-center justify-center">
                      <div className="absolute inset-4 border border-gold/5" />
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-gold)_1px,_transparent_1px)] bg-[size:12px_12px]" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                  {/* Text Container */}
                  <div className="relative z-10 p-8 flex flex-col gap-2">
                    <span className="text-gold text-[9px] tracking-[0.3em] uppercase font-sans font-light">
                      View Collection
                    </span>
                    <h3 className="font-display text-2xl text-ivory font-light group-hover:text-gold-light transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-ivory/50 text-[11px] font-sans font-light tracking-wide leading-relaxed line-clamp-2 mt-1">
                      {category.description || `Exquisite handlooms selected for ${category.name} wear.`}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 4: HERITAGE DRIFT STRIP ── */}
      <section className="bg-deep py-24 text-ivory relative border-y border-gold/15 overflow-hidden">
        {/* Repeating text background drift */}
        <div className="absolute inset-0 flex items-center pointer-events-none opacity-2 hover:opacity-3 transition-opacity duration-500 select-none">
          <div className="font-display text-[150px] uppercase font-semibold tracking-[0.2em] whitespace-nowrap animate-heritage-drift text-gold/30">
            SAKHY HERITAGE SAKHY HERITAGE SAKHY HERITAGE SAKHY HERITAGE
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center flex flex-col items-center">
          <ScrollReveal direction="up">
            <span className="text-gold text-[10px] tracking-[0.4em] uppercase mb-8 block">
              62 Years of Preservation
            </span>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <p className="font-display text-2xl sm:text-3xl italic font-light leading-relaxed text-ivory/80 max-w-3xl mb-8">
              &ldquo;A saree is not merely six yards of silk. It is a canvas of mathematical precision, agricultural devotion, and spiritual handcrafting.&rdquo;
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-gold">
              — The Weavers of Kanchipuram
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SECTION 5: STATS BAR ── */}
      <section className="bg-silk/25 py-12 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Sarees Handwoven", val: "10K+" },
            { label: "Artisan Weavers", val: "200+" },
            { label: "Weaving Hubs", val: "28" },
            { label: "Legacy Years", val: "62" },
          ].map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 0.1}>
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-3xl text-gold font-light">
                  {stat.val}
                </span>
                <span className="text-[9px] font-sans tracking-[0.2em] uppercase text-muted font-light">
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 6: FEATURED PRODUCTS ── */}
      <section id="products" className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <SectionHeading tag="Featured Masterpieces" title="The Heirloom *Selection*" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featuredProducts.map((product, idx) => (
            <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>

        <div className="flex justify-center">
          <ScrollReveal direction="up">
            <Button variant="outline" size="lg" href="/collections">
              View All Creations
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SECTION 7: WEAVES SHOWCASE ── */}
      <section id="weaves" className="bg-deep py-24 border-y border-gold/15 text-ivory">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16 flex flex-col items-center">
              <span className="text-gold text-[10px] tracking-[0.4em] uppercase mb-4 block font-sans font-light">
                Regional Hubs
              </span>
              <h2 className="font-display text-4xl text-ivory font-light leading-snug">
                Chronicles of the *Loom*
              </h2>
              <div className="w-12 h-[1px] bg-gold/45 mt-5" />
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
                <div className="border border-gold/15 p-6 hover:border-gold/40 transition-colors duration-500 h-full flex flex-col bg-charcoal/20">
                  <span className="text-gold font-display text-lg mb-1 block">
                    {weave.hub}
                  </span>
                  <span className="text-[8px] font-sans text-muted tracking-widest uppercase mb-4 block">
                    {weave.tag}
                  </span>
                  <p className="text-[11px] font-sans font-light tracking-wide text-ivory/50 leading-relaxed mt-auto">
                    {weave.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: PROCESS STEPS ── */}
      <section id="process" className="py-24 px-6 sm:px-8 max-w-7xl mx-auto border-b border-gold/10">
        <ScrollReveal direction="up">
          <SectionHeading tag="Artisan Journey" title="Path of the *Six Yards*" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, idx) => (
            <ScrollReveal key={step.num} direction="up" delay={idx * 0.1}>
              <div className="flex flex-col gap-4 relative">
                <span className="font-display text-5xl text-gold/25 font-light">
                  {step.num}
                </span>
                <h3 className="font-display text-lg text-charcoal font-normal">
                  {step.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── SECTION 9: TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="bg-silk/20 py-24 border-b border-gold/10">
          <ScrollReveal direction="up">
            <SectionHeading tag="Patron Accounts" title="Worn with *Pride*" />
          </ScrollReveal>
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <TestimonialCarousel testimonials={testimonials} speed={36} />
          </div>
        </section>
      )}
    </div>
  );
}
