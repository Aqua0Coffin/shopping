"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  items: string[];
  speed?: number; // seconds for one full pass (default 25)
  direction?: "left" | "right";
  separator?: string; // character between items (default ◆)
  className?: string;
}

/**
 * Infinite scrolling marquee using Framer Motion.
 * Items are duplicated internally — do NOT pre-duplicate in the parent.
 * Respects prefers-reduced-motion (static display when motion is reduced).
 */
export default function Marquee({
  items,
  speed = 25,
  direction = "left",
  separator = "◆",
  className = "",
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Duplicate items for seamless infinite loop
  const doubled = [...items, ...items];

  return (
    <div
      className={`overflow-hidden ${className}`}
      aria-hidden="true" // decorative — no semantic content
    >
      <motion.div
        ref={trackRef}
        className="flex w-max gap-[60px]"
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
            className="flex items-center gap-[60px] whitespace-nowrap"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.7)",
              textTransform: "uppercase",
            }}
          >
            {item}
            <span style={{ fontSize: 8, color: "var(--color-crimson)" }}>
              {separator}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
