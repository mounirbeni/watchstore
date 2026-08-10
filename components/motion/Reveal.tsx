"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  /** Which way the content travels in from. */
  from?: Direction;
  /** Seconds of delay — use to cascade sibling blocks. */
  delay?: number;
  duration?: number;
  /** Travel distance in pixels. */
  distance?: number;
  /** Slight scale-up on entry, for imagery. */
  zoom?: boolean;
  className?: string;
  as?: ElementType;
  /** Fraction of the element that must be visible before it fires. */
  amount?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Sign of the starting offset per direction — `left` starts to the left of its
 * final position, and so on. Horizontal starts are deliberately signed this way
 * so `from="left"` overhangs the left edge, which never widens the page.
 */
const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  none: { x: 0, y: 0 },
};

/**
 * Scroll-triggered entrance. Fires once, honours `prefers-reduced-motion`
 * by rendering the content already settled.
 */
export default function Reveal({
  children,
  from = "up",
  delay = 0,
  duration = 0.7,
  distance = 28,
  zoom = false,
  className,
  as = "div",
  amount = 0.2,
}: RevealProps) {
  const prefersReduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (prefersReduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const offset = OFFSETS[from];
  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x * distance,
      y: offset.y * distance,
      scale: zoom ? 0.97 : 1,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration, ease: EASE, delay },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -60px 0px" }}
    >
      {children}
    </MotionTag>
  );
}
