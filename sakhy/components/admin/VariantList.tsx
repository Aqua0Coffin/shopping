"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import VariantForm from "./VariantForm";

interface Props {
  productId: string;
  variants: any[];
}

export default function VariantList({ productId, variants }: Props) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;
    try {
      const res = await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete variant");
      router.refresh();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-charcoal">Variants</h2>
        {!adding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            Add Variant
          </Button>
        )}
      </div>

      {adding && (
        <VariantForm 
          productId={productId} 
          onSuccess={() => setAdding(false)} 
          onCancel={() => setAdding(false)} 
        />
      )}

      {variants.length === 0 && !adding ? (
        <div className="border border-gold/15 bg-silk/5 p-8 text-center text-sm text-muted">
          No variants added yet.
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((v) => (
            <div key={v.id}>
              {editingId === v.id ? (
                <VariantForm 
                  productId={productId} 
                  initialData={v} 
                  onSuccess={() => setEditingId(null)} 
                  onCancel={() => setEditingId(null)} 
                />
              ) : (
                <div className="border border-gold/15 bg-ivory p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {v.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.images[0]} alt={v.color} className="w-16 h-16 object-cover border border-gold/20" />
                    ) : (
                      <div className="w-16 h-16 bg-silk/30 border border-gold/20 flex items-center justify-center text-xs text-muted/50">No Image</div>
                    )}
                    <div>
                      <p className="font-medium text-charcoal">{v.sku} — {v.color}</p>
                      <p className="text-xs text-muted">
                        ₹{(v.price / 100).toFixed(2)} • Stock: {v.inventory?.stockQty ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(v.id)}>Edit</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(v.id)} className="text-crimson hover:bg-crimson/10">Delete</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
