"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface CountUpProps {
  /** Numeric part of the figure, e.g. 4.9 */
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts a headline figure up when it scrolls into view. Renders the final
 * value straight away for reduced-motion users and for the server pass, so the
 * number is always readable and crawlable.
 */
export default function CountUp({ value, decimals = 0, prefix = "", suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReduced = useReducedMotion();

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 70, damping: 22, mass: 0.8 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (prefersReduced) return;
    setDisplay(0);
  }, [prefersReduced]);

  useEffect(() => {
    if (prefersReduced || !inView) return;
    motionValue.set(value);
  }, [inView, motionValue, value, prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    return spring.on("change", (v) => setDisplay(v));
  }, [spring, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
