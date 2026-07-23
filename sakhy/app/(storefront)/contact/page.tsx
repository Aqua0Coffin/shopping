"use client";

import React, { useState } from "react";
import ScrollReveal from "@/components/motion/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API posting
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1200);
  };

  return (
    <div className="py-28 px-6 sm:px-8 max-w-6xl mx-auto bg-ivory font-sans font-light">
      <ScrollReveal direction="up">
        <SectionHeading tag="Patron Relations" title="Connect with our *Studio*" />
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mt-8">
        {/* Contact Info Panel */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-display text-xl text-gold font-normal mb-3">
                The Heritage Studio
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed max-w-sm">
                Sakhy House, Weavers Lane,<br />
                Kanchipuram, Tamil Nadu 631501,<br />
                India
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl text-gold font-normal mb-3">
                WhatsApp Consultation
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed max-w-sm mb-4">
                Schedule a virtual video call with our curators to preview weave texture, weight, and border contrasting.
              </p>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-gold text-gold hover:bg-gold hover:text-deep transition-all duration-300 px-5 py-2.5 text-[10px] uppercase tracking-widest font-medium cursor-pointer"
              >
                Start WhatsApp Call
              </a>
            </div>

            <div>
              <h3 className="font-display text-xl text-gold font-normal mb-3">
                Patron Support
              </h3>
              <p className="text-xs text-charcoal/80 leading-relaxed max-w-sm">
                Phone: +91 44 2722 0000<br />
                Email: curate@sakhy.local
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Contact Form */}
        <ScrollReveal direction="up" delay={0.2}>
          <form onSubmit={handleSubmit} className="border border-gold/10 p-8 sm:p-10 bg-silk/5 flex flex-col gap-6">
            <h3 className="font-display text-lg text-charcoal font-normal border-b border-gold/10 pb-4">
              Leave a Message
            </h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[10px] uppercase tracking-widest text-muted">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-transparent border-b border-gold/30 focus:border-gold py-2 text-xs focus:outline-none text-charcoal tracking-wide"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] uppercase tracking-widest text-muted">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-transparent border-b border-gold/30 focus:border-gold py-2 text-xs focus:outline-none text-charcoal tracking-wide"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-muted">Phone Number</label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-transparent border-b border-gold/30 focus:border-gold py-2 text-xs focus:outline-none text-charcoal tracking-wide"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-[10px] uppercase tracking-widest text-muted">Tell us about your occasion</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-transparent border-b border-gold/30 focus:border-gold py-2 text-xs focus:outline-none text-charcoal tracking-wide resize-none"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-4">
              Send Message
            </Button>

            {success && (
              <p className="text-xs text-center text-gold/80 bg-gold/5 border border-gold/20 py-3 mt-4 leading-relaxed">
                Thank you. Our loom curators will contact you within 24 hours.
              </p>
            )}
          </form>
        </ScrollReveal>
      </div>
    </div>
  );
}
