"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

interface Testimonial {
  id: string;
  customerName: string;
  quote: string;
  location: string;
  imageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
}

interface Props {
  initial?: Testimonial | null;
  onSave: (t: Testimonial) => void;
  onCancel: () => void;
}

export default function TestimonialForm({ initial, onSave, onCancel }: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    customerName: initial?.customerName ?? "",
    quote: initial?.quote ?? "",
    location: initial?.location ?? "",
    imageUrl: initial?.imageUrl ?? "",
    isPublished: initial?.isPublished ?? true,
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      imageUrl: form.imageUrl || undefined,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/testimonials/${initial!.id}` : "/api/admin/testimonials",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        return;
      }

      onSave(data.testimonial);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gold/20 bg-silk/10 p-6 space-y-5"
    >
      <h2 className="font-display text-xl text-charcoal font-light">
        {isEdit ? "Edit Testimonial" : "New Testimonial"}
      </h2>

      {error && (
        <p className="text-crimson text-xs bg-crimson/5 border border-crimson/20 px-4 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-muted">
            Customer Name *
          </label>
          <input
            required
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            className="border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-muted">
            Location *
          </label>
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Mumbai, Maharashtra"
            className="border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-widest text-muted">
          Quote *
        </label>
        <textarea
          required
          rows={4}
          value={form.quote}
          onChange={(e) => set("quote", e.target.value)}
          className="border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-muted">
            Sort Order
          </label>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            className="border border-gold/20 bg-ivory px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-gold/50"
          />
          <p className="text-[10px] text-muted">Lower = shown first on homepage.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest text-muted">
            Visibility
          </label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="accent-gold w-4 h-4"
            />
            <span className="text-sm text-charcoal">Published (visible on homepage)</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-widest text-muted">
          Customer Photo (optional)
        </label>
        <ImageUploader
          value={form.imageUrl ? [form.imageUrl] : []}
          onChange={(urls) => set("imageUrl", urls[urls.length - 1] ?? "")}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-gold text-deep text-[10px] uppercase tracking-widest font-medium hover:bg-gold-light transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gold/30 text-charcoal text-[10px] uppercase tracking-widest hover:border-gold/60 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
