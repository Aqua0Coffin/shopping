import { prisma } from "@/lib/prisma";
import ScrollReveal from "@/components/motion/ScrollReveal";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    fabric?: string;
    occasion?: string;
    price?: string;
  }>;
}

// Pre-render known category slugs at build time
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { fabric, occasion, price } = await searchParams;

  // 1. Fetch category details
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // 2. Fetch distinct fabrics and occasions within this category for filter options
  const [distinctFabrics, distinctOccasions] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: category.id, status: "published" },
      select: { fabricType: true },
      distinct: ["fabricType"],
    }),
    prisma.product.findMany({
      where: { categoryId: category.id, status: "published" },
      select: { occasion: true },
      distinct: ["occasion"],
    }),
  ]);

  // 3. Parse and construct Prisma query filters
  const priceFilter = price ? price.split("-") : null;
  const minPricePaise = priceFilter?.[0] ? parseInt(priceFilter[0]) * 100 : undefined;
  const maxPricePaise = priceFilter?.[1] ? parseInt(priceFilter[1]) * 100 : undefined;

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      status: "published",
      fabricType: fabric || undefined,
      occasion: occasion || undefined,
      variants: minPricePaise || maxPricePaise ? {
        some: {
          price: {
            gte: minPricePaise,
            lte: maxPricePaise,
          },
        },
      } : undefined,
    },
    include: {
      variants: {
        orderBy: { price: "asc" },
      },
    },
  });

  // Helper to generate clean URLs for filter links
  const getFilterUrl = (type: "fabric" | "occasion" | "price", value: string | null) => {
    const paramsObj = { fabric, occasion, price };
    if (value === null) {
      delete paramsObj[type];
    } else {
      paramsObj[type] = value;
    }

    const query = Object.entries(paramsObj)
      .filter(([_, val]) => !!val)
      .map(([k, val]) => `${k}=${encodeURIComponent(val!)}`)
      .join("&");

    return `/collections/${slug}${query ? `?${query}` : ""}`;
  };

  const priceRanges = [
    { label: "Under ₹15,000", value: "0-15000" },
    { label: "₹15,000 - ₹35,000", value: "15000-35000" },
    { label: "₹35,000 - ₹55,000", value: "35000-55000" },
    { label: "Over ₹55,000", value: "55000-999999" },
  ];

  return (
    <div className="py-28 px-6 sm:px-8 max-w-7xl mx-auto bg-ivory">
      {/* Breadcrumbs */}
      <nav className="text-[10px] tracking-widest uppercase mb-8 text-muted font-sans font-light flex gap-2">
        <Link href="/" className="hover:text-gold transition-colors duration-300">Home</Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-gold transition-colors duration-300">Collections</Link>
        <span>/</span>
        <span className="text-charcoal font-normal">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-light text-charcoal mb-4">
          {category.name}
        </h1>
        <p className="text-sm text-muted max-w-2xl leading-relaxed font-sans font-light">
          {category.description || `Explore our handpicked range of ${category.name} master weaves.`}
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-8">
          <div className="border-b border-gold/15 pb-4 flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider font-sans font-medium text-charcoal">
              Filters
            </span>
            {(fabric || occasion || price) && (
              <Link
                href={`/collections/${slug}`}
                className="text-[9px] uppercase tracking-widest text-crimson hover:text-red-800 transition-colors duration-300 font-sans font-medium"
              >
                Clear All
              </Link>
            )}
          </div>

          {/* Fabric Filter */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-muted">
              Fabric
            </span>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <Link
                href={getFilterUrl("fabric", null)}
                className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                  !fabric
                    ? "text-gold border-gold font-normal"
                    : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                }`}
              >
                All Fabrics
              </Link>
              {distinctFabrics.map((f) => (
                <Link
                  key={f.fabricType}
                  href={getFilterUrl("fabric", f.fabricType)}
                  className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                    fabric === f.fabricType
                      ? "text-gold border-gold font-normal"
                      : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                  }`}
                >
                  {f.fabricType}
                </Link>
              ))}
            </div>
          </div>

          {/* Occasion Filter */}
          {distinctOccasions.some((o) => !!o.occasion) && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-muted">
                Occasion
              </span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Link
                  href={getFilterUrl("occasion", null)}
                  className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                    !occasion
                      ? "text-gold border-gold font-normal"
                      : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                  }`}
                >
                  All Occasions
                </Link>
                {distinctOccasions
                  .filter((o) => o.occasion !== null)
                  .map((o) => (
                    <Link
                      key={o.occasion!}
                      href={getFilterUrl("occasion", o.occasion)}
                      className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                        occasion === o.occasion
                          ? "text-gold border-gold font-normal"
                          : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                      }`}
                    >
                      {o.occasion}
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Price Filter */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-muted">
              Value Range
            </span>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <Link
                href={getFilterUrl("price", null)}
                className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                  !price
                    ? "text-gold border-gold font-normal"
                    : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                }`}
              >
                All Prices
              </Link>
              {priceRanges.map((range) => (
                <Link
                  key={range.value}
                  href={getFilterUrl("price", range.value)}
                  className={`text-xs font-sans tracking-wide py-1.5 px-3 lg:px-0 lg:py-0 w-fit transition-colors duration-300 border lg:border-none ${
                    price === range.value
                      ? "text-gold border-gold font-normal"
                      : "text-charcoal/70 border-gold/10 font-light hover:text-gold"
                  }`}
                >
                  {range.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <div className="flex-grow">
          {products.length === 0 ? (
            <div className="border border-gold/15 p-16 text-center bg-silk/10">
              <span className="font-display text-lg text-muted block mb-2">No Loom Matches</span>
              <p className="text-xs text-muted/70 max-w-sm mx-auto font-sans font-light">
                We currently do not have any published masterpieces matching these filters in the collection.
              </p>
              <Link
                href={`/collections/${slug}`}
                className="mt-6 inline-block bg-gold text-deep text-[10px] font-sans font-medium uppercase tracking-widest px-6 py-3 hover:bg-gold-light transition-all duration-300"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ScrollReveal key={product.id} direction="up">
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
