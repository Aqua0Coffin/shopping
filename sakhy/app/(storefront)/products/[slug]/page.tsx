import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductInteractive from "@/components/storefront/ProductInteractive";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render known product pages at build time
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

// Generate premium SEO titles and meta descriptions
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: "Product Not Found — Sakhy",
    };
  }

  return {
    title: `${product.name} — Authentic ${product.fabricType} Saree | Sakhy`,
    description: product.description || `Hand-woven ${product.fabricType} saree from Sakhy heritage weavers. Pure zari and silk.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch product with variants and active inventory counts
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        include: {
          inventory: {
            select: {
              stockQty: true,
              reservedQty: true,
              lowStockThreshold: true,
            },
          },
        },
      },
    },
  });

  if (!product || product.status !== "published") {
    notFound();
  }

  return (
    <div className="py-28 px-6 sm:px-8 max-w-7xl mx-auto bg-ivory">
      {/* Breadcrumbs */}
      <nav className="text-[10px] tracking-widest uppercase mb-8 text-muted font-sans font-light flex gap-2">
        <Link href="/" className="hover:text-gold transition-colors duration-300">Home</Link>
        <span>/</span>
        <Link href={`/collections/${product.category.slug}`} className="hover:text-gold transition-colors duration-300">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-charcoal font-normal">{product.name}</span>
      </nav>

      {/* Main Product Interaction Area */}
      <ProductInteractive product={product} />
    </div>
  );
}
