"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Category = { id: string; name: string };

interface Props {
  categories: Category[];
  initialData?: any;
}

export default function ProductForm({ categories, initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || (categories[0]?.id ?? ""),
    fabricType: initialData?.fabricType || "",
    occasion: initialData?.occasion || "",
    status: initialData?.status || "draft",
    basePrice: initialData?.basePrice ? (initialData.basePrice / 100).toString() : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !initialData) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      basePrice: Math.round(parseFloat(formData.basePrice) * 100),
    };

    try {
      const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const method = initialData ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      if (!initialData) {
        router.push(`/admin/products/${data.product.id}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${initialData.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-crimson text-sm">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Slug</label>
          <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted mb-2">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Category</label>
          <select required name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold">
            <option value="" disabled>Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Fabric Type</label>
          <input required name="fabricType" value={formData.fabricType} onChange={handleChange} placeholder="e.g. Kanjivaram Silk" className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Occasion</label>
          <input name="occasion" value={formData.occasion} onChange={handleChange} placeholder="e.g. Bridal" className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Base Price (₹)</label>
          <input required type="number" min="1" step="any" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted mb-2">Status</label>
          <select required name="status" value={formData.status} onChange={handleChange} className="w-full border border-gold/30 bg-transparent p-3 focus:outline-none focus:border-gold">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div>
          {initialData && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || loading}
              className="text-xs uppercase tracking-widest text-crimson hover:text-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          )}
        </div>
        <Button type="submit" loading={loading} disabled={isDeleting}>
          {initialData ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
