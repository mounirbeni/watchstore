"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Mouse } from "lucide-react";

interface HeroSlide {
  image: string;
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const SLIDES: HeroSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=1600&q=90",
    eyebrow: "Collection Exclusive",
    titleTop: "L'Art du",
    titleAccent: "Temps",
    description: "Chaque pièce raconte une histoire d'élégance et de précision absolue.",
    primaryLabel: "Explorer",
    primaryHref: "/shop",
    secondaryLabel: "Haute Horlogerie",
    secondaryHref: "/shop?category=luxe",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=90",
    eyebrow: "Nouvelle Arrivée",
    titleTop: "Précision",
    titleAccent: "Suisse",
    description: "Des mécanismes d'exception au service du raffinement pur.",
    primaryLabel: "Nouveautés",
    primaryHref: "/shop",
    secondaryLabel: "Nos Marques",
    secondaryHref: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1600&q=90",
    eyebrow: "Édition Limitée",
    titleTop: "L'Élégance",
    titleAccent: "Intemporelle",
    description: "Des modèles rares pour ceux qui refusent de passer inaperçus.",
    primaryLabel: "Voir la sélection",
    primaryHref: "/shop",
    secondaryLabel: "Pièces vedettes",
    secondaryHref: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1600&q=90",
    eyebrow: "Classique Moderne",
    titleTop: "Le Style",
    titleAccent: "Signature",
    description: "L'alliance parfaite entre tradition horlogère et design contemporain.",
    primaryLabel: "Découvrir",
    primaryHref: "/shop",
    secondaryLabel: "Tout voir",
    secondaryHref: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1600&q=90",
    eyebrow: "Sport & Luxe",
    titleTop: "Puissance",
    titleAccent: "& Classe",
    description: "Pour l'homme qui mène sa vie à pleine vitesse sans sacrifier le style.",
    primaryLabel: "Collection Sport",
    primaryHref: "/shop",
    secondaryLabel: "En savoir plus",
    secondaryHref: "/shop",
  },
];

const AUTOPLAY_MS = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Copy blocks rise in sequence each time a slide takes over. */
const copyVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.12 + i * 0.09 },
  }),
};

export default function HeroCarousel({ slides: propSlides }: HeroCarouselProps = {}) {
  const ACTIVE_SLIDES = propSlides && propSlides.length > 0 ? propSlides : SLIDES;
  const slideCount = ACTIVE_SLIDES.length;
  const prefersReduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback(
    (i: number, dir = 1) => {
      setDirection(dir);
      setIndex(((i % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );
  const next = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((c) => (c + 1) % slideCount);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, slideCount]);

  // Arrow keys drive the carousel once it has been interacted with.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const slide = ACTIVE_SLIDES[index]!;

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0B0B0C] aspect-[4/5] sm:aspect-[16/7] sm:max-h-[820px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Mises en avant"
    >
      {/* ── Imagery: crossfade + slow Ken Burns push ─────────── */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: prefersReduced ? 1 : 1.1, x: prefersReduced ? 0 : direction * 24 }}
          animate={{
            opacity: 1,
            scale: prefersReduced ? 1 : 1.04,
            x: 0,
            transition: {
              opacity: { duration: 1.1, ease: "easeOut" },
              x: { duration: 1.1, ease: EASE },
              scale: { duration: AUTOPLAY_MS / 1000 + 1.5, ease: "linear" },
            },
          }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={`${slide.titleTop} ${slide.titleAccent}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay gradients — intentionally hardcoded, they sit over photography */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      {/* Vignette for depth */}
      <div
        aria-hidden
        className="absolute inset-0 z-10"
        style={{ boxShadow: "inset 0 0 180px 40px rgba(0,0,0,0.55)" }}
      />

      {/* ── Slide counter ─────────────────────────────────────── */}
      <div className="absolute right-5 top-5 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-xs font-bold tabular-nums text-gold-400">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-xs text-white/40">/</span>
        <span className="text-xs text-white/50">{String(slideCount).padStart(2, "0")}</span>
      </div>

      {/* ── Copy ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center">
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-14 sm:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={slide.image} className="max-w-2xl" initial="hidden" animate="visible" exit="hidden">
              <motion.p
                custom={0}
                variants={copyVariants}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-black/30 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-400 backdrop-blur-sm sm:text-xs"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {slide.eyebrow}
              </motion.p>

              <motion.h1
                custom={1}
                variants={copyVariants}
                className="mb-4 font-serif text-[2.7rem] font-bold leading-[0.92] text-white sm:mb-5 sm:text-6xl md:text-7xl lg:text-8xl"
              >
                {slide.titleTop}
                <br />
                <span className="gold-gradient-text">{slide.titleAccent}</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={copyVariants}
                className="mb-7 max-w-md text-sm leading-relaxed text-white/75 sm:mb-8 sm:text-lg"
              >
                {slide.description}
              </motion.p>

              <motion.div custom={3} variants={copyVariants} className="flex flex-wrap gap-3">
                <Link
                  href={slide.primaryHref}
                  className="sheen sheen-dark inline-flex h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-gold-500 px-5 text-sm font-bold text-black shadow-xl shadow-gold-500/30 transition-all duration-200 hover:bg-gold-400 active:scale-[0.97] sm:h-[3.25rem] sm:flex-none sm:px-8 sm:text-base"
                >
                  {slide.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={slide.secondaryHref}
                  className="inline-flex h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-2xl border border-gold-500/60 bg-white/5 px-5 text-sm font-semibold text-gold-400 backdrop-blur-sm transition-all duration-200 hover:bg-gold-500/15 active:scale-[0.97] sm:h-[3.25rem] sm:flex-none sm:px-8 sm:text-base"
                >
                  {slide.secondaryLabel}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Prev / next ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-black/40 text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:bg-gold-500/20 active:scale-95 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-5 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-black/40 text-gold-400 backdrop-blur-sm transition hover:border-gold-400 hover:bg-gold-500/20 active:scale-95 sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Progress dots — the active one fills with the timer ─ */}
      <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {ACTIVE_SLIDES.map((s, i) => (
          <button
            key={s.image}
            type="button"
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={`h-[3px] overflow-hidden rounded-full transition-all duration-500 ${
              i === index ? "w-12 bg-white/25" : "w-3 bg-white/35 hover:bg-white/60"
            }`}
          >
            {i === index && (
              <motion.span
                key={s.image}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: prefersReduced ? 0.2 : AUTOPLAY_MS / 1000, ease: "linear" }}
                className="block h-full origin-left bg-gold-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Scroll cue — desktop only ─────────────────────────── */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-6 right-6 z-30 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45 lg:flex"
      >
        <Mouse className="h-3.5 w-3.5" />
        Faire défiler
      </motion.div>
    </section>
  );
}
