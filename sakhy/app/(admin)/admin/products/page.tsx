import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Products — Sakhy Admin" };

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  draft:     "bg-amber-50   text-amber-700   border-amber-200/60",
  archived:  "bg-stone-50   text-stone-500   border-stone-200/60",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      variants: {
        select: {
          id: true,
          sku: true,
          inventory: { select: { stockQty: true, lowStockThreshold: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[2rem] font-light text-[#1A0A00] leading-none">Products</h1>
          <p className="mt-1 text-[11px] text-[#8A7B6A] uppercase tracking-widest font-sans">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button href="/admin/products/new" id="new-product-btn" size="sm">
          + New Product
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#B08D5E]/15 bg-white overflow-hidden overflow-x-auto">
        <table className="w-full text-xs font-sans whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#B08D5E]/10">
              {["Name", "Status", "Category", "Base Price", "Variants / Stock", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-3.5 text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal ${i === 0 ? "pl-6 text-left" : i === 5 ? "pr-6 text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="pl-6 pr-6 py-14 text-center text-[#8A7B6A]">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-[#B08D5E] hover:underline">
                    Add your first →
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((p, i) => {
                const totalStock = p.variants.reduce(
                  (sum, v) => sum + (v.inventory?.stockQty ?? 0),
                  0
                );
                const hasLowStock = p.variants.some(
                  (v) => v.inventory && v.inventory.stockQty <= v.inventory.lowStockThreshold
                );
                const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.draft;
                return (
                  <tr
                    key={p.id}
                    id={`product-row-${p.id}`}
                    className={`hover:bg-[#F5EFE9]/60 transition-colors ${
                      i !== products.length - 1 ? "border-b border-[#B08D5E]/6" : ""
                    }`}
                  >
                    <td className="pl-6 pr-4 py-4">
                      <p className="text-[#1A0A00] font-medium">{p.name}</p>
                      <p className="text-[#8A7B6A] text-[10px] font-mono mt-0.5">{p.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${st}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[#2C2416]/70">{p.category.name}</td>
                    <td className="px-4 py-4 font-display text-[#1A0A00]">
                      {formatPrice(p.basePrice)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[#2C2416]/70">
                        {p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}
                      </span>
                      <span className={`ml-2 text-[10px] ${hasLowStock ? "text-[#8B1A1A]" : "text-[#8A7B6A]"}`}>
                        ({totalStock} in stock{hasLowStock ? " ⚠" : ""})
                      </span>
                    </td>
                    <td className="pr-6 pl-4 py-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-[10px] uppercase tracking-widest text-[#B08D5E] hover:text-[#C9AC7E] transition-colors"
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
