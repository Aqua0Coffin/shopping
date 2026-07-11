import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/motion/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

export const revalidate = 60;

export default async function CollectionsPage() {
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
    <div className="py-28 px-6 sm:px-8 max-w-7xl mx-auto bg-ivory">
      <ScrollReveal direction="up">
        <SectionHeading
          tag="Storefront Catalogue"
          title="The Curated *Collections*"
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((category, idx) => {
          const firstProduct = category.products[0];
          const image = firstProduct?.variants[0]?.images?.[0];
          const productCount = category._count.products;

          return (
            <ScrollReveal key={category.id} direction="up" delay={idx * 0.15}>
              <Link
                href={`/collections/${category.slug}`}
                className="group relative flex flex-col justify-end aspect-[4/5] bg-silk/30 overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:shadow-[0_12px_24px_-10px_rgba(201,168,76,0.1)]"
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
                <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-500" />

                {/* Text Container */}
                <div className="relative z-10 p-8 flex flex-col gap-2">
                  <span className="text-gold text-[9px] tracking-[0.3em] uppercase font-sans font-light">
                    {productCount} {productCount === 1 ? "Creation" : "Creations"}
                  </span>
                  <h3 className="font-display text-2xl text-ivory font-light group-hover:text-gold-light transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-ivory/55 text-[11px] font-sans font-light tracking-wide leading-relaxed line-clamp-2 mt-1">
                    {category.description || `Exquisite handlooms selected for ${category.name} wear.`}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
