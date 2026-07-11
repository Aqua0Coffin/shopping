"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  location: string;
  rating: number; // 1-5
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  speed?: number; // seconds per full cycle (default 30)
  cardWidthPx?: number;
}

/**
 * Auto-scrolling testimonial carousel.
 * - Pauses on hover or keyboard focus (accessible).
 * - Duplicates items internally for seamless infinite loop.
 * - Screen reader sees all testimonials as a list (aria-label).
 */
export default function TestimonialCarousel({
  testimonials,
  speed = 30,
  cardWidthPx = 380,
}: TestimonialCarouselProps) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const doubled = [...testimonials, ...testimonials];
  const totalWidth = doubled.length * (cardWidthPx + 32); // gap 32px

  return (
    <section
      aria-label="Customer testimonials"
      className="overflow-hidden"
    >
      <motion.div
        ref={trackRef}
        className="flex gap-8"
        style={{ width: totalWidth }}
        animate={{ x: paused ? undefined : ["0px", `-${totalWidth / 2}px`] }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {doubled.map((t, i) => (
          <article
            key={`${t.id}-${i}`}
            className="flex-shrink-0 p-10 relative"
            style={{
              width: cardWidthPx,
              background: "var(--color-ivory)",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
            // Only first set is real; duplicates are aria-hidden
            aria-hidden={i >= testimonials.length}
          >
            {/* Decorative opening quote */}
            <span
              aria-hidden="true"
              className="absolute top-5 left-8"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 80,
                lineHeight: 1,
                color: "rgba(201,168,76,0.2)",
                pointerEvents: "none",
              }}
            >
              &ldquo;
            </span>

            {/* Stars */}
            <div
              className="mb-3"
              style={{ color: "var(--color-gold)", letterSpacing: 3, fontSize: 12 }}
              aria-label={`${t.rating} out of 5 stars`}
            >
              {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
            </div>

            <p
              className="mt-4 mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontStyle: "italic",
                lineHeight: 1.7,
                color: "var(--color-charcoal)",
              }}
            >
              {t.text}
            </p>

            <footer>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--color-muted)",
                }}
              >
                {t.author}
              </p>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.6)",
                }}
              >
                {t.location}
              </p>
            </footer>
          </article>
        ))}
      </motion.div>
    </section>
  );
}
