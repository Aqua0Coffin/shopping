"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BRAND_LETTERS = ["S", "A", "K", "H", "Y"];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  // Hide after animation completes (~3.2s)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6"
          style={{ background: "var(--color-deep)" }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          {/* Brand name — letter-rise animation */}
          <div
            className="overflow-hidden flex"
            aria-label="Sakhy"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 8vw, 72px)",
              color: "var(--color-gold)",
              letterSpacing: "0.3em",
              fontWeight: 300,
            }}
          >
            {BRAND_LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: "easeOut" }}
                style={{ display: "inline-block" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="relative overflow-hidden"
            style={{
              width: 200,
              height: 1,
              background: "rgba(201,168,76,0.2)",
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "var(--color-gold)" }}
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }}
            />
          </div>

          {/* Sub-tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              letterSpacing: "0.4em",
              color: "rgba(201,168,76,0.5)",
              textTransform: "uppercase",
            }}
          >
            Heritage Sarees
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
