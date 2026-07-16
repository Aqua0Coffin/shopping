import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdjustStockForm from "@/components/admin/AdjustStockForm";

interface Props {
  params: Promise<{ variantId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { variantId } = await params;
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { sku: true },
  });
  return { title: variant ? `Inventory — ${variant.sku}` : "Inventory" };
}

export default async function InventoryVariantPage({ params }: Props) {
  const { variantId } = await params;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
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

  if (!variant) notFound();

  // Fetch audit trail separately — most recent 50 entries
  const logs = await prisma.inventoryLog.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      changeQty: true,
      reason: true,
      actorId: true,
      note: true,
      createdAt: true,
    },
  });

  const inv = variant.inventory;
  const available = inv ? Math.max(0, inv.stockQty - inv.reservedQty) : null;
  const isLow = inv != null && inv.stockQty <= inv.lowStockThreshold;

  const statCard = (label: string, value: string | number, highlight = false) => (
    <div className="border border-gold/15 bg-silk/10 p-4">
      <p className="text-[9px] uppercase tracking-widest text-muted mb-1.5">{label}</p>
      <p className={`font-display text-2xl font-light ${highlight ? "text-crimson" : "text-charcoal"}`}>
        {value}
      </p>
    </div>
  );

  return (
    <section className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted">
        <Link href="/admin/inventory" className="hover:text-gold transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-charcoal">{variant.sku}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-light text-charcoal">
          {variant.product.name}
        </h1>
        <p className="text-xs text-muted mt-1">
          SKU: <span className="font-mono text-charcoal">{variant.sku}</span>
          &nbsp;·&nbsp;Color: {variant.color}
        </p>
        {isLow && (
          <p className="mt-2 text-[11px] text-crimson font-medium">
            ⚠ This SKU is at or below its low-stock threshold.
          </p>
        )}
      </div>

      {/* Stock summary cards */}
      {inv ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCard("Stock Qty", inv.stockQty, isLow)}
          {statCard("Reserved", inv.reservedQty)}
          {statCard("Available", available ?? 0)}
          {statCard("Threshold", inv.lowStockThreshold)}
        </div>
      ) : (
        <p className="text-xs text-crimson border border-crimson/20 bg-crimson/5 px-4 py-3">
          No inventory record exists for this variant. Create one via the products admin.
        </p>
      )}

      {/* Adjustment form */}
      {inv && (
        <div className="border border-gold/15 bg-ivory p-6 space-y-4 max-w-md">
          <h2 className="font-display text-xl font-light text-charcoal">
            Manual Adjustment
          </h2>
          <p className="text-[10px] text-muted uppercase tracking-widest">
            Every adjustment is logged in the audit trail below.
          </p>
          <AdjustStockForm
            variantId={variantId}
            currentStockQty={inv.stockQty}
          />
        </div>
      )}

      {/* Audit trail */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-light text-charcoal">
          Audit Trail
        </h2>

        <div className="border border-gold/15 bg-ivory overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-silk/20 text-[10px] uppercase tracking-widest text-muted border-b border-gold/15">
              <tr>
                <th className="px-5 py-3.5 font-normal">Date / Time</th>
                <th className="px-5 py-3.5 font-normal">Change</th>
                <th className="px-5 py-3.5 font-normal">Reason</th>
                <th className="px-5 py-3.5 font-normal">Actor</th>
                <th className="px-5 py-3.5 font-normal">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted text-xs">
                    No inventory changes recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isPositive = log.changeQty > 0;
                  return (
                    <tr key={log.id} className="hover:bg-silk/5 transition-colors">
                      <td className="px-5 py-3 text-xs text-muted tabular-nums">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td
                        className={`px-5 py-3 font-mono font-medium tabular-nums ${
                          isPositive ? "text-emerald-900" : "text-crimson"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {log.changeQty}
                      </td>
                      <td className="px-5 py-3 text-charcoal/80 capitalize">
                        {log.reason}
                      </td>
                      <td className="px-5 py-3 text-charcoal/80 text-xs max-w-[180px] truncate">
                        {log.actorId}
                      </td>
                      <td className="px-5 py-3 text-muted text-xs max-w-[240px] truncate">
                        {log.note ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
