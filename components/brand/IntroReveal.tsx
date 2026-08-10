"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { BRAND } from "./Logo";
import markSrc from "@/public/brand/mark.png";

/**
 * Cinematic first-impression sequence: a gold light pool blooms, the emblem
 * irises open from the centre and settles out of a glow, a light sweeps across
 * it, the wordmark letters rise, then the screen splits open on the storefront.
 *
 * Rules it respects:
 *  - plays once per browser session (sessionStorage), never on repeat views;
 *  - never on deep links — homepage only;
 *  - fully skipped for `prefers-reduced-motion`;
 *  - server-rendered so there is no flash of the page before it covers,
 *    and hidden pre-paint by the inline script in the root layout for
 *    visitors who already watched it.
 */

const STORAGE_KEY = "cc-intro-v1";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_CURTAIN = [0.83, 0, 0.17, 1] as const;

const WORD_LEAD = BRAND.nameLead.split("");
const WORD_TAIL = BRAND.nameTail.split("");

/** Total runtime before the curtain opens, in seconds. */
const RUNTIME = 3.2;

export default function IntroReveal() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  // Server and first client render agree on `true`; the effect below decides
  // whether this visitor actually gets to see it.
  const [playing, setPlaying] = useState(true);

  const finish = useCallback(() => {
    setPlaying(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode — the intro simply plays again next load */
    }
  }, []);

  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen || prefersReduced) {
      setPlaying(false);
      document.documentElement.classList.add("intro-done");
      return;
    }
    const timer = window.setTimeout(finish, RUNTIME * 1000);
    return () => window.clearTimeout(timer);
  }, [finish, prefersReduced]);

  // Freeze the page underneath while the curtain is closed.
  useEffect(() => {
    if (!playing) {
      document.documentElement.classList.add("intro-done");
      return;
    }
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [playing]);

  // Let people out early — Escape, click, or the skip button.
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, finish]);

  if (pathname !== "/") return null;

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          id="cc-intro"
          key="intro"
          role="presentation"
          onClick={finish}
          initial={{ opacity: 1 }}
          exit={{ clipPath: "inset(50% 0 50% 0)", opacity: 0 }}
          transition={{ duration: 0.85, ease: EASE_CURTAIN }}
          className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0B0B0C]"
          style={{ clipPath: "inset(0% 0 0% 0)" }}
        >
          {/* Ambient gold light pool */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="pointer-events-none absolute h-[78vmin] w-[78vmin] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.22) 0%, rgba(201,168,106,0.07) 45%, transparent 70%)",
            }}
          />

          {/* Fine grid — depth without noise */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(circle at center, black 10%, transparent 68%)",
              WebkitMaskImage: "radial-gradient(circle at center, black 10%, transparent 68%)",
            }}
          />

          <motion.div
            exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="relative flex flex-col items-center px-6"
          >
            {/* ── The emblem, irising open out of the glow ─────── */}
            <div className="relative">
              {/* Halo that blooms behind it */}
              <motion.span
                aria-hidden
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.9, 0.45], scale: [0.4, 1.15, 1] }}
                transition={{ duration: 1.9, ease: EASE_OUT, times: [0, 0.55, 1] }}
                className="pointer-events-none absolute inset-0 -m-10 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(221,194,140,0.35) 0%, rgba(201,168,106,0.12) 40%, transparent 68%)",
                }}
              />

              <motion.div
                initial={{ clipPath: "circle(0% at 50% 55%)", scale: 1.18, opacity: 0 }}
                animate={{ clipPath: "circle(75% at 50% 55%)", scale: 1, opacity: 1 }}
                transition={{
                  clipPath: { duration: 1.25, ease: EASE_OUT, delay: 0.2 },
                  scale: { duration: 1.7, ease: EASE_OUT, delay: 0.2 },
                  opacity: { duration: 0.5, delay: 0.2 },
                }}
                className="relative"
              >
                <Image
                  src={markSrc}
                  alt={BRAND.name}
                  priority
                  sizes="(max-width: 640px) 60vw, 380px"
                  className="h-auto w-[58vw] max-w-[380px] select-none object-contain sm:w-[34vw]"
                />

                {/* Light sweeping across the emblem */}
                <motion.span
                  aria-hidden
                  initial={{ x: "-140%" }}
                  animate={{ x: "140%" }}
                  transition={{ duration: 1.15, ease: "easeInOut", delay: 1.35 }}
                  className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-screen"
                />
              </motion.div>
            </div>

            {/* ── Wordmark ──────────────────────────────────────── */}
            <div className="mt-6 flex overflow-hidden font-serif text-4xl font-bold tracking-tight sm:text-6xl">
              {[
                ...WORD_LEAD.map((ch) => ({ ch, gold: false })),
                ...WORD_TAIL.map((ch) => ({ ch, gold: true })),
              ].map(({ ch, gold }, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.62, ease: EASE_OUT, delay: 1.3 + i * 0.045 }}
                  className={gold ? "text-gold-500" : "text-white"}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* ── Tagline flanked by expanding rules ────────────── */}
            <div className="mt-5 flex items-center gap-4">
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 44, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.9 }}
                className="h-px bg-gradient-to-r from-transparent to-gold-500/70"
              />
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.95 }}
                className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.42em] text-white/55 sm:text-xs"
              >
                {BRAND.tagline}
              </motion.p>
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 44, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.9 }}
                className="h-px bg-gradient-to-l from-transparent to-gold-500/70"
              />
            </div>
          </motion.div>

          {/* ── Loading rule ───────────────────────────────────── */}
          <div className="absolute bottom-16 h-px w-40 overflow-hidden bg-white/10 sm:w-56">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: RUNTIME - 0.2, ease: "linear" }}
              className="h-full origin-left bg-gradient-to-r from-gold-500/40 via-gold-500 to-gold-300"
            />
          </div>

          {/* ── Skip ───────────────────────────────────────────── */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              finish();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 transition-colors hover:border-gold-500/60 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
          >
            Passer
            <ChevronsRight className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
