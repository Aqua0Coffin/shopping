"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Custom gold cursor: small dot + larger ring.
 * ONLY rendered on fine-pointer (desktop/mouse) devices.
 * Activates body.custom-cursor-active to suppress the default cursor.
 *
 * Expands and turns crimson when hovering a or button elements.
 */
export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on fine-pointer (mouse) devices
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setIsFinePointer(true);
    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      setIsHovering(
        !!target.closest("a, button, [role='button'], [data-cursor-hover]")
      );
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        ref={dotRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
        animate={{
          x: position.x - (isHovering ? 10 : 6),
          y: position.y - (isHovering ? 10 : 6),
          width:  isHovering ? 20 : 12,
          height: isHovering ? 20 : 12,
          backgroundColor: isHovering
            ? "var(--color-crimson)"
            : "var(--color-gold)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.3 }}
      />

      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        style={{ border: "1px solid", opacity: 0.7 }}
        animate={{
          x: position.x - (isHovering ? 30 : 18),
          y: position.y - (isHovering ? 30 : 18),
          width:  isHovering ? 60 : 36,
          height: isHovering ? 60 : 36,
          borderColor: isHovering
            ? "var(--color-crimson)"
            : "var(--color-gold)",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
      />
    </>
  );
}
