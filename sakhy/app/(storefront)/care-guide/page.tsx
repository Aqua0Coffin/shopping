import ScrollReveal from "@/components/motion/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

  const sections = [
    {
      title: "Storage Dynamics",
      items: [
        "Never hang a silk saree on metal hangers — this causes permanent crease marks and tears.",
        "Store each saree wrapped in a muslin cloth or cotton bag to allow the silk threads to breathe.",
        "Refold your heirloom sarees every three months to prevent thread tension from breaking along lines."
      ]
    },
    {
      title: "Washing & Dyes",
      items: [
        "Dry clean only. Handwashing or machine washing will strip the natural sheen and warp the zari.",
        "If a liquid spill occurs, dab immediately with dry tissue. Never rub, as it embeds stains in fibers.",
        "Do not apply perfumes directly to the saree body — alcohol can cause discoloration on pure dyes."
      ]
    },
    {
      title: "Ironing Techniques",
      items: [
        "Iron on the reverse side only, using low-medium heat settings.",
        "Place a soft cotton cloth between the iron and the saree to protect the zari from heat damage.",
        "Never use steam ironing on pure silk as water droplets can cause permanent spotting."
      ]
    }
  ];

export default function CareGuidePage() {

  return (
    <div className="py-28 px-6 sm:px-8 max-w-3xl mx-auto bg-ivory font-sans font-light">
      <ScrollReveal direction="up">
        <SectionHeading tag="Preservation Guides" title="Caring for your *Heirloom*" />
      </ScrollReveal>

      <p className="text-sm text-center leading-relaxed text-charcoal/80 mb-12 max-w-xl mx-auto">
        A hand-woven saree is a living fabric. With proper preservation, it will retain its lustre, strength, and vibrancy to be passed down through generations.
      </p>

      <div className="flex flex-col gap-10">
        {sections.map((section, idx) => (
          <ScrollReveal key={section.title} direction="up" delay={idx * 0.1}>
            <div className="border border-gold/10 p-6 sm:p-8 bg-silk/10">
              <h3 className="font-display text-xl text-gold font-normal mb-5 pb-2 border-b border-gold/10">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3.5 text-xs text-charcoal/85 list-disc pl-4 leading-relaxed">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
