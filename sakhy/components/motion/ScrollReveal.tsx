"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;        // seconds (default 0)
  direction?: "up" | "left" | "right" | "none";
  distance?: number;     // px offset (default 40)
  duration?: number;     // seconds (default 0.8)
  className?: string;
  once?: boolean;        // only animate once (default true)
}

/**
 * Wraps children in a motion.div that fades + slides into view
 * when the element enters the viewport.
 * Falls back gracefully with no motion if prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  distance = 40,
  duration = 0.8,
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  const directionOffset = {
    up:    { y: distance, x: 0 },
    left:  { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    none:  { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionOffset }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
