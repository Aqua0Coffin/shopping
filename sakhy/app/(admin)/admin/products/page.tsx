import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: {
        select: {
          id: true,
          inventory: { select: { stockQty: true } },
        },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-light text-charcoal">Products</h1>
        <Button href="/admin/products/new" size="sm">New Product</Button>
      </div>

      <div className="border border-gold/15 bg-ivory overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-silk/20 text-[10px] uppercase tracking-widest text-muted border-b border-gold/15">
            <tr>
              <th className="px-6 py-4 font-normal">Name</th>
              <th className="px-6 py-4 font-normal">Status</th>
              <th className="px-6 py-4 font-normal">Category</th>
              <th className="px-6 py-4 font-normal">Price</th>
              <th className="px-6 py-4 font-normal">Variants / Stock</th>
              <th className="px-6 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const totalStock = p.variants.reduce(
                  (sum, v) => sum + (v.inventory?.stockQty || 0),
                  0
                );
                return (
                  <tr key={p.id} className="hover:bg-silk/5 transition-colors">
                    <td className="px-6 py-4 text-charcoal font-medium">
                      {p.name}
                      <p className="text-[10px] text-muted font-normal mt-0.5">{p.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${
                        p.status === "published" ? "bg-emerald-900/10 text-emerald-900" :
                        p.status === "draft" ? "bg-amber-900/10 text-amber-900" :
                        "bg-stone-900/10 text-stone-900"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal/80">{p.category.name}</td>
                    <td className="px-6 py-4 font-display">{formatPrice(p.basePrice)}</td>
                    <td className="px-6 py-4 text-charcoal/80">
                      {p.variants.length} ({totalStock} qty)
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/products/${p.id}`} className="text-xs uppercase tracking-widest text-gold hover:text-gold-light">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
