"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollRowProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScrollRow({ children, className = "" }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, [update]);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        aria-label="Défiler à gauche"
        className={[
          "hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
          "w-9 h-9 rounded-full bg-white border border-luxury-border shadow-lg",
          "items-center justify-center text-luxury-white",
          "hover:bg-gold-500 hover:border-gold-500 hover:text-black",
          "transition-all duration-200",
          "opacity-0 group-hover/row:opacity-100",
          canLeft ? "pointer-events-auto" : "pointer-events-none opacity-0!",
        ].join(" ")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Scrollable track */}
      <div
        ref={ref}
        className={`flex overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 ${className}`}
      >
        {children}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        aria-label="Défiler à droite"
        className={[
          "hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
          "w-9 h-9 rounded-full bg-white border border-luxury-border shadow-lg",
          "items-center justify-center text-luxury-white",
          "hover:bg-gold-500 hover:border-gold-500 hover:text-black",
          "transition-all duration-200",
          "opacity-0 group-hover/row:opacity-100",
          canRight ? "pointer-events-auto" : "pointer-events-none opacity-0!",
        ].join(" ")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
