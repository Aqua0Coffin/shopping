import ScrollReveal from "@/components/motion/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HeritagePage() {
  const timeline = [
    { year: "1964", title: "The First Loom", text: "Founded in Yeola by a family of weavers wanting to preserve the traditional cotton-silk tapestry weaves." },
    { year: "1988", title: "Preserving Kanjivaram", text: "Opened a collaborative workshop in Kanchipuram to guarantee fair-trade wages and pure zari material controls." },
    { year: "2012", title: "Heirloom Archives", text: "Established the Sakhy archival library, collecting and restoring pattern drawings from the 18th century." },
    { year: "2026", title: "The Modern Loom", text: "Bridging generational weavers with patrons globally, keeping the craft viable for the next generation." },
  ];

  return (
    <div className="py-28 px-6 sm:px-8 max-w-4xl mx-auto bg-ivory font-sans font-light">
      <ScrollReveal direction="up">
        <SectionHeading tag="Our Narrative" title="Chronicles of *Sakhy*" />
      </ScrollReveal>

      {/* Main Story */}
      <div className="flex flex-col gap-8 text-sm leading-relaxed text-charcoal/80 mb-16">
        <p className="font-display text-xl sm:text-2xl italic font-light text-charcoal/90 text-center leading-relaxed max-w-2xl mx-auto mb-4">
          &ldquo;We do not weave threads. We weave the history of cotton fields, organic dyes, and the mathematical precision of the loom.&rdquo;
        </p>
        <p>
          Sakhy is born out of a desire to rescue traditional handloom weaving from the speeds of fast fashion. Sourced directly from authentic weaver cooperatives in Kanchipuram, Banaras, Yeola, and Chanderi, our sarees represent the zenith of regional craft.
        </p>
        <p>
          Every saree takes between three weeks to three months to complete. By ensuring that every single thread of gold and silver zari is verified and each weaver is compensated with premium wages, we protect the dignity of the artisan and the legacy of the loom.
        </p>
      </div>

      {/* Timeline Section */}
      <div className="border-t border-gold/15 pt-16">
        <h3 className="font-display text-2xl text-center text-charcoal mb-12">
          The Warp and Weft Timeline
        </h3>

        <div className="flex flex-col gap-10 max-w-2xl mx-auto">
          {timeline.map((item, idx) => (
            <ScrollReveal key={item.year} direction="up" delay={idx * 0.1}>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                <span className="font-display text-3xl text-gold font-light border-b border-gold/20 pb-1 sm:border-none min-w-[80px]">
                  {item.year}
                </span>
                <div>
                  <h4 className="font-display text-lg text-charcoal font-normal mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
