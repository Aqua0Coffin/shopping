import ScrollReveal from "@/components/motion/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

  const policies = [
    {
      title: "Artisan Timelines",
      text: "All sarees are shipped in premium wood boxes wrapped in protective tissue. Domestic shipping within India is completely complimentary and takes 5–8 business days via our premium courier partners. International delivery is not active at launch.",
    },
    {
      title: "Insured Transit",
      text: "Every package sent from our studio is fully insured during transit. If your parcel is damaged or lost before delivery, we will issue a full refund or replace the weave immediately, depending on stock availability.",
    },
    {
      title: "Exchanges & Returns",
      text: "Since each saree is hand-woven by specific artisan families, returns are eligible only for genuine weave defects or shipping damages reported within 48 hours of receipt. Custom blouse stitching, if ordered, voids return eligibility.",
    },
  ];

export default function ShippingPage() {

  return (
    <div className="py-28 px-6 sm:px-8 max-w-3xl mx-auto bg-ivory font-sans font-light">
      <ScrollReveal direction="up">
        <SectionHeading tag="Shipping & Returns" title="Loom to *Patron* Policies" />
      </ScrollReveal>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-charcoal/80">
        {policies.map((p, idx) => (
          <ScrollReveal key={p.title} direction="up" delay={idx * 0.1}>
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg text-charcoal font-normal">
                {p.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {p.text}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
