import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted">
        <Link href="/admin/products" className="hover:text-gold transition-colors">Products</Link>
        <span>/</span>
        <span className="text-charcoal">New Product</span>
      </div>

      <div className="border border-gold/15 bg-silk/10 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-light text-charcoal mb-6">Create Product</h1>
        <ProductForm categories={categories} />
      </div>
    </section>
  );
}
