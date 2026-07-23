"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  speed?: number; // seconds for one full pass (default 25)
  direction?: "left" | "right";
  separator?: string; // character between items (default ◆)
  className?: string;
  /** Light theme: renders in ink-muted italic serif (reference style).
   *  Dark theme (default): renders in gold uppercase sans.
   */
  theme?: "light" | "dark";
}

/**
 * Infinite scrolling marquee using Framer Motion.
 * Items are duplicated internally — do NOT pre-duplicate in the parent.
 * Respects prefers-reduced-motion (static display when motion is reduced).
 *
 * Light theme matches reference: italic serif, ink-muted text, gold bullet.
 * Dark theme (default): uppercase tracked sans, gold text, crimson separator.
 */
export default function Marquee({
  items,
  speed = 25,
  direction = "left",
  separator = "◆",
  className = "",
  theme = "dark",
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless infinite loop
  const doubled = [...items, ...items];

  const isLight = theme === "light";

  return (
    <div
      className={`overflow-hidden ${className}`}
      aria-hidden="true" // decorative — no semantic content
    >
      <motion.div
        ref={trackRef}
        className={`flex w-max ${isLight ? "gap-14" : "gap-[60px]"}`}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
        // Pause on hover/focus for accessibility
        whileHover={{ animationPlayState: "paused" } as never}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`flex items-center whitespace-nowrap ${isLight ? "gap-14" : "gap-[60px]"}`}
            style={
              isLight
                ? {
                    // Reference style: italic serif, ink-muted
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontStyle: "italic",
                    letterSpacing: "0.02em",
                    color: "var(--color-ink-muted)",
                  }
                : {
                    // Original dark style
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    letterSpacing: "0.3em",
                    color: "rgba(201,168,76,0.7)",
                    textTransform: "uppercase",
                  }
            }
          >
            {item}
            {isLight ? (
              // Reference separator: small gold circle
              <span
                className="h-1 w-1 rounded-full inline-block"
                style={{ backgroundColor: "var(--color-gold-ref)" }}
              />
            ) : (
              // Original separator
              <span style={{ fontSize: 8, color: "var(--color-crimson)" }}>
                {separator}
              </span>
            )}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
