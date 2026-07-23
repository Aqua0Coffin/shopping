import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import VariantList from "@/components/admin/VariantList";
import Link from "next/link";

export default async function EditProductPage(
  props: { params: Promise<{ productId: string }> }
) {
  const { productId } = await props.params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: { inventory: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted">
        <Link href="/admin/products" className="hover:text-gold transition-colors">Products</Link>
        <span>/</span>
        <span className="text-charcoal">Edit Product</span>
      </div>

      <div className="border border-gold/15 bg-silk/10 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-light text-charcoal mb-6">Edit {product.name}</h1>
        <ProductForm categories={categories} initialData={product} />
        
        <VariantList productId={product.id} variants={product.variants} />
      </div>
    </section>
  );
}
