import { prisma } from "@/lib/prisma";
import PageLoader from "@/components/motion/PageLoader";
import CustomCursor from "@/components/motion/CustomCursor";
import Marquee from "@/components/motion/Marquee";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TestimonialCarousel, { Testimonial } from "@/components/motion/TestimonialCarousel";

// Testimonial reference items from index.html
const referenceTestimonials: Testimonial[] = [
  {
    id: "1",
    rating: 5,
    text: "My bridal Kanjivaram from Sakhy was everything I dreamed of. The weight, the lustre, the gold zari — it felt like wearing a piece of history on the most important day of my life.",
    author: "Priya Ramachandran",
    location: "Chennai, Tamil Nadu",
  },
  {
    id: "2",
    rating: 5,
    text: "Three generations of women in my family have worn Sakhy sarees. The quality has never wavered — each piece tells a story of extraordinary skill and devotion.",
    author: "Kavitha Iyer",
    location: "Mumbai, Maharashtra",
  },
  {
    id: "3",
    rating: 5,
    text: "The consultation was like stepping into another era. They understood my aesthetic perfectly and guided me to a Paithani that made my mother weep with joy at the wedding.",
    author: "Ananya Desai",
    location: "Pune, Maharashtra",
  },
];

const weavesList = [
  "Kanjivaram Silk",
  "Banarasi Brocade",
  "Chanderi Cotton",
  "Pochampally Ikat",
  "Paithani Weave",
  "Dhaka Muslin",
  "Sambalpuri Silk",
  "Gadwal Silk",
];

export default async function Home() {
  // Fetch seeded products to verify database connection
  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: {
      variants: true,
    },
  });

  return (
    <>
      {/* ── MOTION SYSTEM ── */}
      <PageLoader />
      <CustomCursor />

      {/* ── HEADER / NAV ── */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between border-b border-gold/10 bg-ivory/80 backdrop-blur-md">
        <a href="#" className="font-display text-2xl tracking-widest hover:text-gold transition-colors duration-300">
          SAKHY
        </a>
        <div className="flex gap-8 items-center text-xs tracking-widest uppercase">
          <a href="#collections" className="hover:text-gold transition-colors duration-300">Collections</a>
          <a href="#products" className="hover:text-gold transition-colors duration-300">Sarees</a>
          <a href="#testimonials" className="hover:text-gold transition-colors duration-300">Stories</a>
          <button className="border border-gold text-gold hover:bg-gold hover:text-ivory px-4 py-2 transition-all duration-300">
            Book Consultation
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="relative h-screen min-h-[600px] flex items-center overflow-hidden bg-deep text-ivory">
        {/* Background Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-charcoal via-deep to-deep" />
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,var(--color-gold)_1px,transparent_1px),_linear-gradient(-45deg,var(--color-gold)_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        {/* Ambient Glows */}
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-crimson/5 blur-[80px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-8 w-full">
          <ScrollReveal direction="up" delay={0.2}>
            <span className="text-gold text-xs tracking-[0.5em] uppercase mb-6 block">
              New Collection 2026
            </span>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <h1 className="font-display text-7xl md:text-8xl font-light leading-none mb-8">
              Draped in <br />
              <em className="text-gold not-italic font-normal">Legacy</em>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.6}>
            <p className="text-sm tracking-wide text-ivory/60 leading-relaxed max-w-md mb-12">
              Handwoven masterpieces born from centuries of tradition — each saree a poem in silk, a story passed down through artisan hands.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.8}>
            <div className="flex gap-4">
              <a href="#products" className="bg-gold text-deep font-medium uppercase text-xs tracking-[0.3em] px-8 py-4 hover:bg-ivory hover:text-deep transition-all duration-300">
                Explore Collections
              </a>
              <a href="#about" className="border border-ivory/30 text-ivory uppercase text-xs tracking-[0.3em] px-8 py-4 hover:border-gold hover:text-gold transition-all duration-300">
                Our Craft
              </a>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* ── INFINITE MARQUEE ── */}
      <div className="bg-deep py-4 border-y border-gold/20">
        <Marquee items={weavesList} speed={30} />
      </div>

      {/* ── SEEDED PRODUCTS PREVIEW ── */}
      <section id="products" className="py-24 px-8 max-w-7xl mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <span className="text-gold text-xs tracking-[0.5em] uppercase mb-3 block">Curated Masterpieces</span>
            <h2 className="font-display text-4xl md:text-5xl">Database Seed Verification</h2>
            <div className="w-16 h-[1px] bg-gold/50 mx-auto mt-6" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, idx) => {
            const displayPrice = (product.basePrice / 100).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            });

            return (
              <ScrollReveal key={product.id} direction="up" delay={idx * 0.1}>
                <div className="group relative flex flex-col bg-silk/20 border border-gold/10 p-4 transition-all duration-500 hover:border-gold/30 hover:shadow-lg">
                  {/* Decorative Swatch Background */}
                  <div className="aspect-[2/3] w-full bg-silk relative overflow-hidden mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-gold)_1px,_transparent_1px)] bg-[size:12px_12px]" />
                    <span className="font-display text-gold/40 text-lg uppercase tracking-widest">{product.fabricType}</span>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-crimson text-ivory text-[9px] tracking-widest uppercase px-3 py-1">
                      Seed Data
                    </div>
                  </div>

                  <span className="text-xs text-muted tracking-wider uppercase mb-1">{product.fabricType}</span>
                  <h3 className="font-display text-xl text-deep mb-2 font-normal">{product.name}</h3>
                  <p className="text-crimson font-display text-lg mt-auto">{displayPrice}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="bg-silk/30 py-24 border-t border-gold/10">
        <ScrollReveal direction="up">
          <div className="text-center mb-16">
            <span className="text-gold text-xs tracking-[0.5em] uppercase mb-3 block">Stories of Grace</span>
            <h2 className="font-display text-4xl md:text-5xl">Worn with Love</h2>
            <div className="w-16 h-[1px] bg-gold/50 mx-auto mt-6" />
          </div>
        </ScrollReveal>

        <TestimonialCarousel testimonials={referenceTestimonials} speed={35} />
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-deep text-ivory/60 text-xs tracking-wider py-12 px-8 border-t border-gold/10 text-center">
        <p className="font-display text-gold text-lg tracking-widest mb-4">SAKHY</p>
        <p className="mb-2">Phase 1 Scaffold Complete — Next.js 15 + Prisma 7 + Tailwind + Framer Motion</p>
        <p className="text-ivory/30">© 2026 Sakhy Heritage. All rights reserved.</p>
      </footer>
    </>
  );
}
