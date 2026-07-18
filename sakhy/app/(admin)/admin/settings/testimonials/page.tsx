import { prisma } from "@/lib/prisma";
import TestimonialsClient from "@/components/admin/TestimonialsClient";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return <TestimonialsClient initial={testimonials} />;
}
