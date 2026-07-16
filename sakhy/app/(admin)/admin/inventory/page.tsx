import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ lowStock?: string }>;
}

export const metadata = { title: "Inventory" };

export default async function AdminInventoryPage({ searchParams }: Props) {
  const { lowStock } = await searchParams;
  const filterLowStock = lowStock === "1";

  // Join everything in one query — fine at this scale
  const variants = await prisma.productVariant.findMany({
    orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
    include: {
      product: { select: { id: true, name: true } },
      inventory: {
        select: {
          stockQty: true,
          reservedQty: true,
          lowStockThreshold: true,
          updatedAt: true,
        },
      },
    },
  });

  // Apply low-stock filter in memory (avoids a raw WHERE expression)
  const rows = filterLowStock
    ? variants.filter(
        (v) =>
          v.inventory &&
          v.inventory.stockQty <= v.inventory.lowStockThreshold
      )
    : variants;

  const totalLowStock = variants.filter(
    (v) =>
      v.inventory && v.inventory.stockQty <= v.inventory.lowStockThreshold
  ).length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light text-charcoal">
            Inventory
          </h1>
          {totalLowStock > 0 && (
            <p className="text-[11px] text-crimson mt-1">
              {totalLowStock} SKU{totalLowStock !== 1 ? "s" : ""} at or below
              low-stock threshold
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          {filterLowStock ? (
            <Link
              href="/admin/inventory"
              className="text-muted border border-gold/20 px-3 py-2 hover:border-gold/50 transition-colors"
            >
              Show All
            </Link>
          ) : (
            <Link
              href="/admin/inventory?lowStock=1"
              className="text-crimson border border-crimson/25 px-3 py-2 hover:border-crimson/50 transition-colors"
            >
              Low Stock Only ({totalLowStock})
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-gold/15 bg-ivory overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-silk/20 text-[10px] uppercase tracking-widest text-muted border-b border-gold/15">
            <tr>
              <th className="px-5 py-4 font-normal">SKU</th>
              <th className="px-5 py-4 font-normal">Product</th>
              <th className="px-5 py-4 font-normal">Color</th>
              <th className="px-5 py-4 font-normal text-right">Stock</th>
              <th className="px-5 py-4 font-normal text-right">Reserved</th>
              <th className="px-5 py-4 font-normal text-right">Available</th>
              <th className="px-5 py-4 font-normal text-right">Threshold</th>
              <th className="px-5 py-4 font-normal text-center">Status</th>
              <th className="px-5 py-4 font-normal text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gold/10">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-12 text-center text-muted text-xs"
                >
                  {filterLowStock
                    ? "No SKUs are currently at or below their low-stock threshold."
                    : "No variants found. Add products and variants first."}
                </td>
              </tr>
            ) : (
              rows.map((v) => {
                const inv = v.inventory;
                const available = inv
                  ? Math.max(0, inv.stockQty - inv.reservedQty)
                  : null;
                const isLow =
                  inv != null && inv.stockQty <= inv.lowStockThreshold;

                return (
                  <tr
                    key={v.id}
                    className={`hover:bg-silk/5 transition-colors ${
                      isLow ? "bg-crimson/[0.02]" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-charcoal/80">
                      {v.sku}
                    </td>
                    <td className="px-5 py-3.5 text-charcoal">
                      <Link
                        href={`/admin/products/${v.product.id}`}
                        className="hover:text-gold transition-colors"
                      >
                        {v.product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-charcoal/80">{v.color}</td>

                    {/* Stock columns */}
                    <td
                      className={`px-5 py-3.5 text-right font-medium tabular-nums ${
                        isLow ? "text-crimson" : "text-charcoal"
                      }`}
                    >
                      {inv?.stockQty ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                      {inv?.reservedQty ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-charcoal/80">
                      {available ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted">
                      {inv?.lowStockThreshold ?? "—"}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5 text-center">
                      {inv == null ? (
                        <span className="text-[9px] uppercase tracking-wider text-muted">
                          No record
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-1 bg-crimson/10 text-crimson">
                          Low Stock
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-1 bg-emerald-900/10 text-emerald-900">
                          OK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/inventory/${v.id}`}
                        className="text-[10px] uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
                      >
                        Adjust
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
