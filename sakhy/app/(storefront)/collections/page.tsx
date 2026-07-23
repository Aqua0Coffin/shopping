import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/motion/ScrollReveal";

export const revalidate = 60;

export default async function CollectionsPage() {
  // DB query fully preserved
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        where: { status: "published" },
        take: 1,
        include: {
          variants: {
            take: 1,
          },
        },
      },
    },
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Page header — reference style */}
      <div
        className="pt-32 pb-16 px-6 sm:px-8 border-b"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        <div className="container-x mx-auto max-w-[1400px]">
          <ScrollReveal direction="up">
            <p
              className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em]"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <span
                className="h-px w-8 inline-block"
                style={{ backgroundColor: "var(--color-gold-ref)" }}
              />
              Storefront Catalogue
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h1
              className="font-display text-4xl md:text-5xl font-light leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              The Curated{" "}
              <em
                className="not-italic font-normal italic"
                style={{ color: "var(--color-gold-ref)" }}
              >
                Collections
              </em>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <div
              className="w-12 h-[1px] mt-5"
              style={{ backgroundColor: "rgba(201,166,107,0.45)" }}
            />
          </ScrollReveal>
        </div>
      </div>

      {/* Collections grid */}
      <div className="py-16 px-6 sm:px-8">
        <div className="container-x mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category, idx) => {
              const firstProduct = category.products[0];
              const image = firstProduct?.variants[0]?.images?.[0];
              const productCount = category._count.products;

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
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(232,220,200,0.4) 0%, rgba(232,220,200,0.8) 100%)",
                        }}
                      >
                        <div
                          className="absolute inset-4 border pointer-events-none"
                          style={{ borderColor: "rgba(201,166,107,0.1)" }}
                        />
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle, var(--color-gold-ref) 1px, transparent 1px)",
                            backgroundSize: "12px 12px",
                          }}
                        />
                      </div>
                    )}

                    {/* Dark gradient overlay — reference style */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(17,17,17,0.55) 0%, transparent 60%)",
                      }}
                    />

                    {/* Text + arrow — reference pattern */}
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] opacity-80">
                            {productCount} {productCount === 1 ? "Creation" : "Creations"}
                          </p>
                          <h3 className="mt-1 font-display text-2xl font-light text-white">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-[11px] leading-relaxed mt-1 opacity-60 line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <span
                          className="grid h-10 w-10 place-items-center rounded-full border transition-all duration-300 flex-shrink-0 group-hover:border-current"
                          style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
