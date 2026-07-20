"use client";

import Image from "next/image";
import { useState } from "react";

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
  testimonials: Testimonial[];
  onDelete: (id: string) => void;
  onEdit: (t: Testimonial) => void;
  onTogglePublish: (id: string, current: boolean) => void;
}

export default function TestimonialList({
  testimonials,
  onDelete,
  onEdit,
  onTogglePublish,
}: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });
      if (res.ok) onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) onTogglePublish(id, current);
  };

  if (testimonials.length === 0) {
    return (
      <p className="text-muted text-sm px-4 py-10 text-center">
        No testimonials yet. Add the first one →
      </p>
    );
  }

  return (
    <div className="border border-gold/15 overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-silk/20 text-[10px] uppercase tracking-widest text-muted border-b border-gold/15">
          <tr>
            <th className="px-5 py-3 font-normal">Order</th>
            <th className="px-5 py-3 font-normal">Customer</th>
            <th className="px-5 py-3 font-normal">Quote</th>
            <th className="px-5 py-3 font-normal">Location</th>
            <th className="px-5 py-3 font-normal">Published</th>
            <th className="px-5 py-3 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gold/10">
          {testimonials.map((t) => (
            <tr key={t.id} className="hover:bg-silk/5 transition-colors">
              <td className="px-5 py-4 text-muted font-mono text-xs">{t.sortOrder}</td>
              <td className="px-5 py-4 text-charcoal font-medium max-w-[160px]">
                {t.imageUrl && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold/20 mb-1"><Image src={t.imageUrl} alt={t.customerName} fill className="object-cover" sizes="32px" /></div>
                )}
                {t.customerName}
              </td>
              <td className="px-5 py-4 text-charcoal/70 max-w-[300px]">
                <span className="line-clamp-2 text-xs">{t.quote}</span>
              </td>
              <td className="px-5 py-4 text-muted text-xs">{t.location}</td>
              <td className="px-5 py-4">
                <button type="button"
                  onClick={() => handleToggle(t.id, t.isPublished)}
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full cursor-pointer transition-colors ${
                    t.isPublished
                      ? "bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20"
                      : "bg-stone-900/10 text-stone-500 hover:bg-stone-900/20"
                  }`}
                >
                  {t.isPublished ? "Live" : "Hidden"}
                </button>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex gap-4 justify-end">
                  <button type="button"
                    onClick={() => onEdit(t)}
                    className="text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="text-xs uppercase tracking-widest text-crimson/70 hover:text-crimson transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {deleting === t.id ? "…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
