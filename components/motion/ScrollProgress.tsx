"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline gold reading indicator pinned under the header. Purely decorative,
 * so it stays out of the accessibility tree.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-gold-600 via-gold-400 to-gold-200"
    />
  );
}
