"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  /** Pixels the surface rises on hover. */
  lift?: number;
  /** Scale applied while pressed — the "tap" feedback. */
  press?: number;
}

/**
 * Thin client wrapper that gives a server-rendered surface a spring-loaded
 * hover lift and press feedback, without turning the surface itself into a
 * client component (product cards keep receiving Prisma values directly).
 */
export default function HoverLift({ children, className, lift = 6, press = 0.985 }: HoverLiftProps) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift }}
      whileTap={{ scale: press }}
      transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
