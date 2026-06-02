"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((c) => (c + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100svh + 4rem)", maxHeight: "calc(100svh + 4rem)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Background images */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-out will-change-opacity ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={`${slide.titleTop} ${slide.titleAccent}`}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Gradients — stronger on mobile for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-luxury-black/95 via-luxury-black/50 to-luxury-black/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-luxury-black/70 via-transparent to-transparent" />

      {/* Slide counter — top right */}
      <div className="absolute top-5 right-5 z-30 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm border border-white/10">
        <span className="text-gold-400 text-xs font-bold tabular-nums">{index + 1}</span>
        <span className="text-white/40 text-xs">/</span>
        <span className="text-white/50 text-xs">{SLIDES.length}</span>
      </div>

      {/* Content — sits at bottom on mobile, centered on desktop */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-10 pb-28 sm:pb-16">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              aria-hidden={i !== index}
              className={`transition-all duration-600 ${
                i === index
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6 absolute pointer-events-none"
              }`}
            >
              {/* Eyebrow */}
              <p className="inline-flex items-center gap-2 text-gold-400 text-[11px] sm:text-sm font-semibold uppercase tracking-[0.28em] mb-4">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {slide.eyebrow}
              </p>

              {/* Title */}
              <h1 className="text-[2.6rem] leading-[0.92] sm:text-6xl md:text-7xl font-serif font-bold text-white mb-4 sm:mb-5">
                {slide.titleTop}
                <br />
                <span className="gold-gradient-text">{slide.titleAccent}</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-lg text-white/75 mb-7 sm:mb-8 leading-relaxed max-w-md">
                {slide.description}
              </p>

              {/* Buttons — large and thumb-friendly on mobile */}
              <div className="flex gap-3 flex-col xs:flex-row sm:flex-row">
                <Link
                  href={slide.primaryHref}
                  className="inline-flex items-center justify-center gap-2 h-14 sm:h-13 px-7 sm:px-8 bg-gold-500 text-black text-base font-bold rounded-2xl hover:bg-gold-400 active:scale-[0.97] transition-all duration-200 shadow-xl shadow-gold-500/30"
                >
                  {slide.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={slide.secondaryHref}
                  className="inline-flex items-center justify-center gap-2 h-14 sm:h-13 px-7 sm:px-8 border border-gold-500/60 bg-white/5 backdrop-blur-sm text-gold-400 text-base font-semibold rounded-2xl hover:bg-gold-500/15 active:scale-[0.97] transition-all duration-200"
                >
                  {slide.secondaryLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows — desktop only */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide précédent"
        className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-black/40 text-gold-400 backdrop-blur-sm transition hover:bg-gold-500/20 hover:border-gold-400"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide suivant"
        className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-black/40 text-gold-400 backdrop-blur-sm transition hover:bg-gold-500/20 hover:border-gold-400"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots — above buttons on mobile */}
      <div className="absolute bottom-[7.5rem] sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={`h-[3px] rounded-full transition-all duration-400 ${
              i === index ? "w-10 bg-gold-500" : "w-3 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Swipe hint — shows briefly on first load on mobile */}
      <div className="sm:hidden absolute bottom-[11rem] right-5 z-30 flex items-center gap-1.5 text-white/30 text-[10px] animate-pulse pointer-events-none">
        <ChevronLeft className="h-3 w-3" />
        <span>Swipe</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </section>
  );
}
