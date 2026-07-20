"use client";

import { useState } from "react";
import TestimonialList from "@/components/admin/TestimonialList";
import TestimonialForm from "@/components/admin/TestimonialForm";

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
  initial: Testimonial[];
}

export default function TestimonialsClient({ initial }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initial);
  const [editing, setEditing] = useState<Testimonial | null | "new">(null);

  const handleSave = (saved: Testimonial) => {
    setTestimonials((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      if (exists) {
        return prev.map((t) => (t.id === saved.id ? saved : t));
      }
      return [saved, ...prev];
    });
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTogglePublish = (id: string, wasPublished: boolean) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isPublished: !wasPublished } : t))
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-charcoal">Testimonials</h1>
          <p className="text-xs text-muted mt-1">
            Changes publish to the homepage within 60 seconds (ISR revalidation).
          </p>
        </div>
        {editing === null && (
          <button type="button"
            onClick={() => setEditing("new")}
            className="px-5 py-2 bg-gold text-deep text-[10px] uppercase tracking-widest font-medium hover:bg-gold-light transition-colors cursor-pointer"
          >
            Add Testimonial
          </button>
        )}
      </div>

      {editing !== null && (
        <TestimonialForm
          initial={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <TestimonialList
        testimonials={testimonials}
        onDelete={handleDelete}
        onEdit={(t) => setEditing(t)}
        onTogglePublish={handleTogglePublish}
      />
    </section>
  );
}
