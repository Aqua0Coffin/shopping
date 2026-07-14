"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";

interface Props {
  productId: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VariantForm({ productId, initialData, onSuccess, onCancel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku: initialData?.sku || "",
    color: initialData?.color || "",
    blouseIncluded: initialData?.blouseIncluded || false,
    borderType: initialData?.borderType || "",
    price: initialData?.price ? (initialData.price / 100).toString() : "",
    weightGrams: initialData?.weightGrams?.toString() || "",
    stockQty: initialData?.inventory?.stockQty?.toString() || "0",
    lowStockThreshold: initialData?.inventory?.lowStockThreshold?.toString() || "5",
    images: initialData?.images || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData((prev) => ({ ...prev, images: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      price: Math.round(parseFloat(formData.price) * 100),
      weightGrams: formData.weightGrams ? parseInt(formData.weightGrams, 10) : null,
      stockQty: parseInt(formData.stockQty, 10),
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
    };

    try {
      const url = initialData
        ? `/api/admin/variants/${initialData.id}`
        : `/api/admin/products/${productId}/variants`;
      const method = initialData ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border border-gold/15 bg-silk/5 p-6 mt-4">
      <h3 className="font-display text-xl text-charcoal">{initialData ? "Edit Variant" : "New Variant"}</h3>
      {error && <p className="text-crimson text-sm">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">SKU</label>
          <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Color</label>
          <input required name="color" value={formData.color} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Price Override (₹)</label>
          <input required type="number" min="1" step="any" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Weight (grams)</label>
          <input type="number" min="1" name="weightGrams" value={formData.weightGrams} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Border Type</label>
          <input name="borderType" value={formData.borderType} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
      </div>

      {!initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gold/20 bg-ivory">
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-2">Initial Stock Qty</label>
            <input required type="number" min="0" name="stockQty" value={formData.stockQty} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-2">Low Stock Threshold</label>
            <input required type="number" min="0" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
          </div>
          <p className="col-span-2 text-xs text-muted/80">Stock management is disabled during edit. Use the Inventory panel to adjust stock later.</p>
        </div>
      )}

      <div>
        <label className="flex items-center gap-3 text-xs uppercase tracking-widest text-charcoal cursor-pointer">
          <input type="checkbox" name="blouseIncluded" checked={formData.blouseIncluded} onChange={handleChange} className="w-4 h-4 accent-gold" />
          Blouse Included
        </label>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">Variant Images</label>
        <ImageUploader value={formData.images} onChange={handleImagesChange} />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading}>{initialData ? "Save Variant" : "Add Variant"}</Button>
      </div>
    </form>
  );
}
