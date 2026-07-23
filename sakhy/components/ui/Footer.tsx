"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setMessage("Thank you. You have been added to our digital chronicle.");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Subscription failed.");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  return (
    <footer className="bg-deep text-ivory/60 border-t border-gold/15 pt-20 pb-12 px-6 sm:px-8 font-sans font-light">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 mb-16">
        {/* Column 1: Brand & Tagline */}
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="font-display text-2xl tracking-[0.3em] text-ivory hover:text-gold transition-colors duration-300 w-fit"
          >
            SAKHY
          </Link>
          <p className="text-xs leading-relaxed tracking-wider text-ivory/50">
            A premium heritage-saree brand dedicated to preserving India&apos;s oldest weaving traditions. Every saree is an heirloom, hand-woven with pure zari and unmatched skill.
          </p>
          <div className="flex gap-4 items-center mt-2">
            {["Instagram", "Pinterest", "WhatsApp"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors duration-300"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Collections Links */}
        <div className="flex flex-col gap-5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-normal">
            Collections
          </span>
          <div className="flex flex-col gap-3 text-xs tracking-wider">
            <Link href="/collections/bridal" className="hover:text-gold transition-colors duration-300">
              The Bridal Edit
            </Link>
            <Link href="/collections/festive" className="hover:text-gold transition-colors duration-300">
              Festive Weaves
            </Link>
            <Link href="/collections/everyday" className="hover:text-gold transition-colors duration-300">
              Classic Everyday
            </Link>
            <Link href="/collections" className="hover:text-gold transition-colors duration-300">
              All Creations
            </Link>
          </div>
        </div>

        {/* Column 3: Quick Links */}
        <div className="flex flex-col gap-5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-normal">
            Heirloom Guide
          </span>
          <div className="flex flex-col gap-3 text-xs tracking-wider">
            <Link href="/heritage" className="hover:text-gold transition-colors duration-300">
              Our Heritage
            </Link>
            <Link href="/care-guide" className="hover:text-gold transition-colors duration-300">
              Saree Care Guide
            </Link>
            <Link href="/shipping" className="hover:text-gold transition-colors duration-300">
              Shipping & Returns
            </Link>
            <Link href="/contact" className="hover:text-gold transition-colors duration-300">
              Consultation Booking
            </Link>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div className="flex flex-col gap-5">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-normal">
            The Chronicle
          </span>
          <p className="text-xs leading-relaxed text-ivory/50">
            Subscribe to receive insights into rare weave preservation and preview new collections.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <div className="flex border-b border-gold/40 focus-within:border-gold transition-colors duration-300">
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-xs py-2 w-full text-ivory focus:outline-none placeholder-ivory/30 tracking-widest"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="text-gold hover:text-gold-light transition-colors duration-300 px-2 py-1 text-[10px] uppercase tracking-widest cursor-pointer"
              >
                {status === "loading" ? "..." : "Join"}
              </button>
            </div>
            {message && (
              <p
                className={`text-[10px] tracking-wider mt-1 leading-relaxed ${
                  status === "error" ? "text-red-400" : "text-gold/80"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-gold/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.2em] uppercase text-ivory/40">
        <div>
          <span>© 2026 SAKHY HERITAGE. ALL RIGHTS RESERVED.</span>
        </div>
        
        {/* Payment Icons */}
        <div className="flex gap-4 items-center">
          <span>UPI / CARDS / RAZORPAY</span>
        </div>
      </div>
    </footer>
  );
}
