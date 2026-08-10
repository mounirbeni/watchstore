"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { BRAND } from "./Logo";

/**
 * Cinematic first-impression sequence: the monogram draws itself stroke by
 * stroke, the hands sweep into the 10:10 position, the wordmark letters rise,
 * a gold light sweeps across, then the screen splits open on the storefront.
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
const RUNTIME = 3.05;

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
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="pointer-events-none absolute h-[70vmin] w-[70vmin] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,106,0.20) 0%, rgba(201,168,106,0.06) 45%, transparent 70%)",
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
            {/* ── Monogram, drawn live ─────────────────────────── */}
            <svg
              viewBox="0 0 64 64"
              fill="none"
              className="h-24 w-24 sm:h-28 sm:w-28"
              aria-label={BRAND.name}
              role="img"
            >
              <defs>
                <linearGradient id="cc-intro-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F2E8D4" />
                  <stop offset="0.5" stopColor="#C9A86A" />
                  <stop offset="1" stopColor="#B08F50" />
                </linearGradient>
              </defs>

              {/* Bezel draws clockwise from 12 o'clock */}
              <motion.circle
                cx="32"
                cy="32"
                r="24"
                stroke="url(#cc-intro-grad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1, rotate: -90 }}
                transition={{ duration: 1.15, ease: EASE_OUT, delay: 0.15 }}
                style={{ transformOrigin: "32px 32px" }}
              />

              <motion.circle
                cx="32"
                cy="32"
                r="18"
                stroke="#FFFFFF"
                strokeOpacity="0.12"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.5 }}
              />

              {/* Indices pop in one after the other */}
              <g stroke="url(#cc-intro-grad)" strokeWidth="2.4" strokeLinecap="round">
                {["M32 12.5v4.5", "M47 32h4.5", "M32 47v4.5", "M12.5 32H17"].map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.75 + i * 0.09 }}
                  />
                ))}
              </g>

              {/* Hands sweep a full turn into 10:10 */}
              <motion.g
                initial={{ rotate: -320, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1.25, ease: EASE_OUT, delay: 0.55 }}
                style={{ transformOrigin: "32px 32px" }}
              >
                <path d="M32 32 21.5 21.5" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M32 32 44 22.5" stroke="#C9A86A" strokeWidth="2.2" strokeLinecap="round" />
              </motion.g>

              <motion.circle
                cx="32"
                cy="32"
                r="2.4"
                fill="url(#cc-intro-grad)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 14, delay: 1.35 }}
                style={{ transformOrigin: "32px 32px" }}
              />
            </svg>

            {/* ── Wordmark ──────────────────────────────────────── */}
            <div className="mt-7 flex overflow-hidden font-serif text-4xl font-bold tracking-tight sm:text-6xl">
              {[
                ...WORD_LEAD.map((ch) => ({ ch, gold: false })),
                ...WORD_TAIL.map((ch) => ({ ch, gold: true })),
              ].map(({ ch, gold }, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ duration: 0.62, ease: EASE_OUT, delay: 1.15 + i * 0.045 }}
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
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.75 }}
                className="h-px bg-gradient-to-r from-transparent to-gold-500/70"
              />
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_OUT, delay: 1.8 }}
                className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.42em] text-white/55 sm:text-xs"
              >
                {BRAND.tagline}
              </motion.p>
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 44, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 1.75 }}
                className="h-px bg-gradient-to-l from-transparent to-gold-500/70"
              />
            </div>

            {/* Light sweep across the lockup */}
            <motion.div
              aria-hidden
              initial={{ x: "-160%" }}
              animate={{ x: "160%" }}
              transition={{ duration: 1.1, ease: "easeInOut", delay: 1.95 }}
              className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
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
