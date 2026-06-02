"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
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
    image: "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=1400&q=90",
    eyebrow: "Collection Exclusive",
    titleTop: "L'Art du",
    titleAccent: "Temps",
    description:
      "Chaque pièce raconte une histoire d'élégance et de précision. Découvrez notre collection de montres d'exception.",
    primaryLabel: "Explorer la collection",
    primaryHref: "/shop",
    secondaryLabel: "Haute Horlogerie",
    secondaryHref: "/shop?category=luxe",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=90",
    eyebrow: "Nouvelle Arrivée",
    titleTop: "Précision",
    titleAccent: "Suisse",
    description:
      "Des mécanismes d'exception au service du raffinement. Une sélection pensée pour les amateurs d'horlogerie.",
    primaryLabel: "Voir les nouveautés",
    primaryHref: "/shop?sort=new",
    secondaryLabel: "Nos marques",
    secondaryHref: "/shop",
  },
  {
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1400&q=90",
    eyebrow: "Édition Limitée",
    titleTop: "L'Élégance",
    titleAccent: "Intemporelle",
    description:
      "Des modèles rares en quantité limitée. Affirmez votre style avec une montre qui ne ressemble qu'à vous.",
    primaryLabel: "Découvrir l'édition",
    primaryHref: "/shop?badge=limited",
    secondaryLabel: "Pièces vedettes",
    secondaryHref: "/shop?featured=true",
  },
];

const AUTOPLAY_MS = 5500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || SLIDES.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative min-h-[88vh] sm:min-h-[80vh] flex items-end sm:items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={`${slide.titleTop} ${slide.titleAccent}`}
            fill
            className="object-cover scale-105"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Layered gradient for an editorial cover feel */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-luxury-black via-luxury-black/55 to-luxury-black/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-luxury-black/80 to-transparent" />

      {/* Slide content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-6 pb-20 sm:pb-0">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className={`max-w-2xl transition-all duration-700 ${
              i === index
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            <p className="inline-flex items-center gap-2 text-gold-400 text-[11px] sm:text-sm font-medium uppercase tracking-[0.3em] mb-4">
              <Sparkles className="h-3.5 w-3.5" /> {slide.eyebrow}
            </p>
            <h1 className="text-[3.25rem] leading-[0.95] sm:text-6xl md:text-7xl font-serif font-bold text-white mb-5">
              {slide.titleTop}
              <br />
              <span className="gold-gradient-text">{slide.titleAccent}</span>
            </h1>
            <p className="text-base sm:text-lg text-luxury-light mb-8 leading-relaxed max-w-lg">
              {slide.description}
            </p>
            <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
              <Link
                href={slide.primaryHref}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-black font-semibold rounded-2xl hover:bg-gold-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gold-500/20"
              >
                {slide.primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={slide.secondaryHref}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold-500/50 text-gold-400 font-medium rounded-2xl hover:bg-gold-500/10 active:scale-[0.98] transition-all duration-200"
              >
                {slide.secondaryLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows (desktop) */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide précédent"
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-luxury-black/40 text-gold-400 backdrop-blur transition hover:bg-gold-500/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Slide suivant"
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 h-11 w-11 items-center justify-center rounded-full border border-gold-500/40 bg-luxury-black/40 text-gold-400 backdrop-blur transition hover:bg-gold-500/20"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller au slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-gold-500" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
