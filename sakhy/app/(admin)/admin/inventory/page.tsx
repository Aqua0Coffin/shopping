import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Inventory — Sakhy Admin" };

interface Props {
  searchParams: Promise<{ lowStock?: string }>;
}

export default async function AdminInventoryPage({ searchParams }: Props) {
  const { lowStock } = await searchParams;
  const filterLowStock = lowStock === "1";

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

  const rows = filterLowStock
    ? variants.filter(
        (v) => v.inventory && v.inventory.stockQty <= v.inventory.lowStockThreshold
      )
    : variants;

  const totalLowStock = variants.filter(
    (v) => v.inventory && v.inventory.stockQty <= v.inventory.lowStockThreshold
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[2rem] font-light text-[#1A0A00] leading-none">Inventory</h1>
          <p className="mt-1 text-[11px] text-[#8A7B6A] uppercase tracking-widest font-sans">
            {rows.length} SKU{rows.length !== 1 ? "s" : ""}
            {filterLowStock ? " · low stock only" : ""}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {totalLowStock > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8B1A1A]/20 bg-[#8B1A1A]/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#8B1A1A] font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A1A] animate-pulse" />
              {totalLowStock} low-stock
            </span>
          )}
          {filterLowStock ? (
            <Link
              href="/admin/inventory"
              id="inventory-show-all"
              className="rounded border border-[#B08D5E]/20 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#8A7B6A] hover:border-[#B08D5E]/50 transition-colors font-sans"
            >
              Show All
            </Link>
          ) : (
            <Link
              href="/admin/inventory?lowStock=1"
              id="inventory-filter-low"
              className="rounded border border-[#8B1A1A]/25 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#8B1A1A] hover:border-[#8B1A1A]/50 transition-colors font-sans"
            >
              Low Stock Only ({totalLowStock})
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#B08D5E]/15 bg-white overflow-hidden overflow-x-auto">
        <table className="w-full text-xs font-sans whitespace-nowrap">
          <thead>
            <tr className="border-b border-[#B08D5E]/10">
              {[
                ["SKU",       "pl-6 text-left"],
                ["Product",   "px-4 text-left"],
                ["Color",     "px-4 text-left"],
                ["Stock",     "px-4 text-right"],
                ["Reserved",  "px-4 text-right"],
                ["Available", "px-4 text-right"],
                ["Threshold", "px-4 text-right"],
                ["Status",    "px-4 text-center"],
                ["",          "pr-6 text-right"],
              ].map(([h, cls], i) => (
                <th key={i} className={`py-3.5 text-[9px] uppercase tracking-widest text-[#8A7B6A] font-normal ${cls}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="pl-6 py-14 text-center text-[#8A7B6A]">
                  {filterLowStock
                    ? "No SKUs are currently at or below their threshold. 🎉"
                    : "No variants found. Add products and variants first."}
                </td>
              </tr>
            ) : (
              rows.map((v, i) => {
                const inv = v.inventory;
                const available = inv ? Math.max(0, inv.stockQty - inv.reservedQty) : null;
                const isLow = inv != null && inv.stockQty <= inv.lowStockThreshold;

                return (
                  <tr
                    key={v.id}
                    id={`inv-row-${v.id}`}
                    className={`transition-colors ${
                      isLow ? "bg-[#8B1A1A]/[0.025] hover:bg-[#8B1A1A]/[0.04]" : "hover:bg-[#F5EFE9]/60"
                    } ${i !== rows.length - 1 ? "border-b border-[#B08D5E]/6" : ""}`}
                  >
                    <td className="pl-6 pr-4 py-4 font-mono text-[#2C2416]/70">{v.sku}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/products/${v.product.id}`}
                        className="text-[#1A0A00] hover:text-[#B08D5E] transition-colors"
                      >
                        {v.product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-[#2C2416]/70">{v.color}</td>
                    <td className={`px-4 py-4 text-right tabular-nums font-medium ${isLow ? "text-[#8B1A1A]" : "text-[#1A0A00]"}`}>
                      {inv?.stockQty ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-[#8A7B6A]">
                      {inv?.reservedQty ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-[#2C2416]/70">
                      {available ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-[#8A7B6A]">
                      {inv?.lowStockThreshold ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {inv == null ? (
                        <span className="text-[10px] text-[#8A7B6A] uppercase tracking-wider">No record</span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#8B1A1A]/25 bg-[#8B1A1A]/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#8B1A1A]">
                          <span className="w-1 h-1 rounded-full bg-[#8B1A1A]" />
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-700">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          OK
                        </span>
                      )}
                    </td>
                    <td className="pr-6 pl-4 py-4 text-right">
                      <Link
                        href={`/admin/inventory/${v.id}`}
                        className="text-[10px] uppercase tracking-widest text-[#B08D5E] hover:text-[#C9AC7E] transition-colors"
                      >
                        Adjust →
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
