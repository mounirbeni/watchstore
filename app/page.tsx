import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import HeroCarousel from "@/components/home/HeroCarousel";
import FaqAccordion from "@/components/home/FaqAccordion";
import ScrollRow from "@/components/ui/ScrollRow";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import CountUp from "@/components/motion/CountUp";
import ScrollProgress from "@/components/motion/ScrollProgress";
import Marquee from "@/components/motion/Marquee";
import LogoMark from "@/components/brand/LogoMark";
import { BRAND } from "@/components/brand/Logo";
import {
  ArrowRight, Shield, Truck, Award, RefreshCw,
  Zap, Star, Quote, CheckCircle2, Clock, Gem,
  Search, ShoppingCart, Package, MapPin, Users, Timer,
  MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getNewArrivals() {
  try {
    return await db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getCategories() {
  try {
    return await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  } catch { return []; }
}

async function getHeroSlides() {
  try {
    return await db.heroSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  } catch { return []; }
}

const TESTIMONIALS = [
  { name: "Youssef B.", city: "Casablanca", stars: 5, text: "Montre reçue en 48h, emballage luxueux et qualité au rendez-vous. Je recommande à 100%." },
  { name: "Amine K.",   city: "Rabat",       stars: 5, text: "Service client impeccable. Ils m&apos;ont aidé à choisir le modèle parfait pour mon budget." },
  { name: "Mehdi R.",   city: "Marrakech",   stars: 5, text: "La montre est encore plus belle en vrai qu&apos;en photo. Rapport qualité-prix exceptionnel." },
  { name: "Khalid T.",  city: "Fès",         stars: 5, text: "Troisième achat ici, toujours aussi satisfait. Ma référence pour l&apos;horlogerie au Maroc." },
];

/** Brand promises that scroll past in the manifesto ticker. */
const MANIFESTO = [
  "Authenticité certifiée",
  "Horlogerie d'exception",
  "Livraison 48h au Maroc",
  "Paiement à la livraison",
  "Service 7j/7",
  "Retours 30 jours",
];

const FAQ_ITEMS = [
  {
    q: "Comment fonctionne le paiement ?",
    a: "Vous versez un petit acompte en ligne pour confirmer votre commande. Le reste est réglé en espèces directement au livreur.",
  },
  {
    q: "Quels sont les délais de livraison ?",
    a: "Nous livrons dans tout le Maroc sous 24 à 72 heures après confirmation de l'acompte.",
  },
  {
    q: "Les montres sont-elles authentiques ?",
    a: "Absolument. Chaque montre est vérifiée et livrée avec ses documents d'origine et une garantie.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui, vous disposez de 30 jours pour retourner un article non porté dans son emballage d'origine.",
  },
];

const STATS = [
  { value: 47,  suffix: "+",  label: "Montres disponibles", Icon: Package },
  { value: 48,  suffix: "h",  label: "Délai de livraison",  Icon: Timer },
  { value: 4.9, suffix: "/5", label: "Satisfaction client", Icon: Star, decimals: 1 },
  { value: 12,  prefix: "+",  label: "Villes desservies",   Icon: MapPin },
];

export default async function HomePage() {
  const [featured, newArrivals, categories, heroSlides] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
    getHeroSlides(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-mobile-nav">
      <ScrollProgress />
      <Header />
      <main className="flex-1">

        {/* ── Hero carousel ─────────────────────────────────────── */}
        <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : undefined} />

        {/* ── Flash promo banner ────────────────────────────────── */}
        <section className="bg-gold-500">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-center gap-3 flex-wrap text-center">
            <Zap className="h-3.5 w-3.5 text-black shrink-0" />
            <p className="text-black text-sm font-semibold">
              Livraison gratuite dès 800 MAD · Paiement en plusieurs fois disponible
            </p>
            <Link href="/shop" className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-black underline underline-offset-2 hover:no-underline">
              Voir les offres <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* ── Brand manifesto ticker ────────────────────────────── */}
        <section className="border-b border-luxury-border bg-luxury-dark py-4">
          <Marquee items={MANIFESTO} speed={38} />
        </section>

        {/* ── Collections cover banner ──────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-12 pb-0 sm:pt-16">
          <Reveal className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <p className="eyebrow mb-1.5">
                <span className="h-px w-6 bg-gold-500" /> Explorer
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">
                Nos <span className="gold-text">Collections</span>
              </h2>
            </div>
            <Link href="/shop" className="group shrink-0 text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors font-medium">
              Tout voir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {/* Two-panel model banner — images come from category imageUrl set in admin */}
          <Stagger className="grid grid-cols-2 gap-3 sm:gap-5" step={0.12}>
            {(["homme", "femme"] as const).map((slug) => {
              const cat = categories.find((c) => c.slug === slug);
              const src = cat?.imageUrl ?? (slug === "homme"
                ? "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=800&q=85"
                : "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=85");
              const label = cat?.name ?? (slug === "homme" ? "Homme" : "Femme");
              const sub   = slug === "homme" ? "Élégance & caractère" : "Grâce & raffinement";
              const href  = `/shop?category=${slug}`;
              return (
                <StaggerItem key={label}>
                  <Link
                    href={href}
                    className="group relative block overflow-hidden rounded-2xl bg-luxury-dark border border-luxury-border hover:border-gold-500/40 hover:shadow-card-hover transition-all duration-300 aspect-[3/4] sm:aspect-[16/9]"
                  >
                    <Image
                      src={src}
                      alt={`Collection ${label}`}
                      fill
                      sizes="(max-width:640px) 50vw, 40vw"
                      className="object-cover object-top transition-transform duration-[900ms] ease-brand group-hover:scale-[1.06]"
                    />
                    {/* subtle bottom gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-1">{sub}</p>
                      <h3 className="text-white font-serif font-bold text-xl sm:text-3xl">{label}</h3>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs sm:text-sm text-white/80 group-hover:text-gold-400 transition-colors font-medium">
                        Découvrir <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        {/* ── Other categories ──────────────────────────────────── */}
        {categories.filter((c) => c.slug !== "homme" && c.slug !== "femme").length > 0 && (
          <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-5 pb-10 sm:pb-16">
            <Reveal>
              <ScrollRow className="gap-3">
                {categories
                  .filter((c) => c.slug !== "homme" && c.slug !== "femme")
                  .map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="group relative shrink-0 w-[38%] sm:w-[190px] aspect-square overflow-hidden rounded-2xl bg-luxury-dark border border-luxury-border hover:border-gold-500/40 hover:shadow-card-hover transition-all duration-300 snap-start"
                    >
                      {cat.imageUrl && (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width:640px) 38vw, 20vw"
                          className="object-cover transition-transform duration-700 ease-brand group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-white font-serif font-semibold text-sm sm:text-base">{cat.name}</h3>
                        <p className="text-gold-400 text-[10px] sm:text-xs mt-0.5">{cat._count.products} pièces</p>
                      </div>
                    </Link>
                  ))}
              </ScrollRow>
            </Reveal>
          </section>
        )}

        {/* ── Featured Products ─────────────────────────────────── */}
        <section className="bg-luxury-dark py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <Reveal className="flex justify-between items-end mb-6 sm:mb-8">
              <div>
                <p className="eyebrow mb-1.5">
                  <span className="h-px w-6 bg-gold-500" /> Sélection
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">
                  Pièces <span className="gold-text">Vedettes</span>
                </h2>
              </div>
              <Link href="/shop" className="group shrink-0 text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors font-medium">
                Voir tout <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            {featured.length === 0 ? (
              <p className="text-luxury-muted text-center py-10">La collection arrive bientôt.</p>
            ) : (
              <Reveal delay={0.1}>
                <ScrollRow className="items-stretch gap-4">
                  {featured.map((p) => (
                    <div key={p.id} className="shrink-0 w-[62%] sm:w-[260px] snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </ScrollRow>
              </Reveal>
            )}
          </div>
        </section>

        {/* ── Editorial / Brand Story ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <Reveal from="left" zoom className="relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-luxury-dark">
              <Image
                src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&q=90"
                alt="Sélection horlogère premium"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="inline-flex items-center gap-1.5 bg-gold-500 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  <Gem className="h-3 w-3" /> Sélection d&apos;exception
                </span>
              </div>
              {/* Floating brand seal */}
              <div className="absolute top-5 right-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/35 backdrop-blur-md motion-safe:animate-float-slow">
                <LogoMark className="h-9 w-auto" />
              </div>
            </Reveal>

            <Stagger className="flex flex-col justify-center gap-6" step={0.1}>
              <StaggerItem>
                <p className="eyebrow mb-3">
                  <span className="h-px w-6 bg-gold-500" /> Notre Histoire
                </p>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-luxury-white leading-tight mb-4 text-balance">
                  L&apos;excellence<br />
                  <span className="gold-text">à portée de main</span>
                </h2>
                <p className="text-sm sm:text-base text-luxury-muted leading-relaxed">
                  Chaque montre de notre collection est sélectionnée avec soin pour allier esthétique raffinée, mécanique fiable et prix accessible. Nous croyons que le luxe ne devrait pas être un privilège.
                </p>
              </StaggerItem>

              <StaggerItem className="flex flex-col gap-3">
                {[
                  "Montres certifiées et authentiques",
                  "Livraison sécurisée dans tout le Maroc",
                  "Service après-vente dédié",
                  "Paiement en plusieurs fois disponible",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0" />
                    <p className="text-sm text-luxury-light">{item}</p>
                  </div>
                ))}
              </StaggerItem>

              <StaggerItem>
                <Link
                  href="/shop"
                  className="sheen sheen-dark inline-flex items-center gap-2 self-start px-6 py-3.5 bg-gold-500 text-black text-sm font-bold rounded-xl hover:bg-gold-400 active:scale-[0.98] transition-all"
                >
                  Découvrir la collection <ArrowRight className="h-4 w-4" />
                </Link>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="bg-luxury-dark py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <Reveal className="text-center mb-10 sm:mb-12">
              <p className="eyebrow mb-2 justify-center">Simple &amp; rapide</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">
                Comment ça <span className="gold-text">marche</span>
              </h2>
            </Reveal>
            <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative" step={0.14}>
              <div className="hidden sm:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-gold-500/30 via-gold-500 to-gold-500/30" />
              {[
                {
                  step: "01",
                  Icon: Search,
                  title: "Choisissez votre montre",
                  desc: "Parcourez notre catalogue de montres premium sélectionnées avec soin — filtrées par marque, style et budget.",
                },
                {
                  step: "02",
                  Icon: ShoppingCart,
                  title: "Passez commande en ligne",
                  desc: "Ajoutez au panier, entrez vos coordonnées et versez un simple acompte pour confirmer votre réservation.",
                },
                {
                  step: "03",
                  Icon: Package,
                  title: "Recevez à domicile",
                  desc: "Votre montre est livrée dans un écrin luxueux. Le solde est réglé en espèces à la livraison.",
                },
              ].map(({ step, Icon, title, desc }) => (
                <StaggerItem key={step} className="relative flex flex-col items-center text-center px-4">
                  <div className="relative mb-5">
                    <span className="absolute inset-0 rounded-2xl bg-gold-500/20 motion-safe:animate-pulse-ring" aria-hidden />
                    <div className="relative w-20 h-20 rounded-2xl bg-white border border-luxury-border shadow-card flex items-center justify-center">
                      <Icon className="h-8 w-8 text-gold-500" strokeWidth={1.6} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-500 text-black text-xs font-bold flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-luxury-white mb-2">{title}</h3>
                  <p className="text-sm text-luxury-muted leading-relaxed">{desc}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.15} className="mt-10 text-center">
              <Link
                href="/shop"
                className="sheen sheen-dark inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 text-black text-sm font-bold rounded-xl hover:bg-gold-400 active:scale-[0.98] transition-all"
              >
                Commencer maintenant <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── New Arrivals ──────────────────────────────────────── */}
        {newArrivals.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
              <Reveal className="flex justify-between items-end mb-6 sm:mb-8">
                <div>
                  <p className="eyebrow mb-1.5">
                    <span className="h-px w-6 bg-gold-500" /> Vient d&apos;arriver
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">
                    Nouvelles <span className="gold-text">Arrivées</span>
                  </h2>
                </div>
                <Link href="/shop" className="group shrink-0 text-sm text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors font-medium">
                  Voir tout <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
              <Reveal delay={0.1}>
                <ScrollRow className="items-stretch gap-4">
                  {newArrivals.map((p) => (
                    <div key={p.id} className="shrink-0 w-[62%] sm:w-[260px] snap-start">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </ScrollRow>
              </Reveal>
            </div>
          </section>
        )}

        {/* ── Testimonials ──────────────────────────────────────── */}
        <section className="bg-luxury-dark py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <Reveal className="text-center mb-8 sm:mb-10">
              <p className="eyebrow mb-2 justify-center">Avis clients</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-3">
                Ce qu&apos;ils <span className="gold-text">disent</span>
              </h2>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                ))}
                <span className="ml-2 text-sm text-luxury-muted">4.9 / 5 · 200+ avis</span>
              </div>
            </Reveal>

            <Stagger
              className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible"
              step={0.09}
            >
              {TESTIMONIALS.map((t) => (
                <StaggerItem
                  key={t.name}
                  className="shrink-0 w-[78%] sm:w-auto snap-start bg-white border border-luxury-border rounded-2xl p-5 flex flex-col gap-3 shadow-card hover:shadow-card-hover hover:border-gold-500/30 transition-all"
                >
                  <Quote className="h-5 w-5 text-gold-500/50" />
                  <p className="text-sm text-luxury-light leading-relaxed flex-1">{t.text}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 border-t border-luxury-border pt-3">
                    <div className="h-8 w-8 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-500">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-luxury-white">{t.name}</p>
                      <p className="text-xs text-luxury-muted">{t.city}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Key numbers strip ────────────────────────────────── */}
        <section className="border-y border-luxury-border">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8 sm:py-10">
            <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center" step={0.1}>
              {STATS.map(({ value, label, Icon, decimals, prefix, suffix }) => (
                <StaggerItem key={label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto">
                    <Icon className="h-5 w-5 text-gold-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif font-bold gold-text tabular-nums">
                    <CountUp
                      value={value}
                      decimals={decimals ?? 0}
                      prefix={prefix ?? ""}
                      suffix={suffix ?? ""}
                    />
                  </p>
                  <p className="text-xs sm:text-sm text-luxury-muted">{label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── FAQ teaser ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-start">
            <Reveal from="left">
              <p className="eyebrow mb-3">
                <span className="h-px w-6 bg-gold-500" /> Questions fréquentes
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-6">
                Vous avez des <span className="gold-text">questions ?</span>
              </h2>
              <FaqAccordion items={FAQ_ITEMS} />
            </Reveal>

            <Stagger className="flex flex-col gap-5" step={0.1}>
              <StaggerItem>
                <p className="eyebrow">Nous contacter</p>
                <h3 className="mt-3 text-xl sm:text-2xl font-serif font-bold text-luxury-white">
                  Une question ? <br />
                  <span className="gold-text">Nous sommes là.</span>
                </h3>
                <p className="mt-3 text-sm text-luxury-muted leading-relaxed">
                  Notre équipe est disponible 7j/7 pour vous aider à trouver la montre parfaite et répondre à toutes vos questions.
                </p>
              </StaggerItem>

              <StaggerItem className="space-y-3">
                {[
                  { Icon: Users, title: "Service client", desc: "Réponse en moins de 2h" },
                  { Icon: Truck, title: "Livraison sécurisée", desc: "Partout au Maroc" },
                  { Icon: Shield, title: "Authenticité garantie", desc: "100% certifié" },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3 p-4 bg-white border border-luxury-border rounded-xl shadow-card transition-colors hover:border-gold-500/30">
                    <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-gold-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-luxury-white">{title}</p>
                      <p className="text-xs text-luxury-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </StaggerItem>

              <StaggerItem>
                <a
                  href="https://wa.me/212600000000"
                  className="sheen inline-flex items-center gap-2 self-start px-6 py-3.5 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1EBE57] active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                  Nous contacter sur WhatsApp
                </a>
              </StaggerItem>
            </Stagger>
          </div>
        </section>

        {/* ── CTA Banner — dark overlay kept intentionally ──────── */}
        <Reveal as="section" zoom className="mx-4 sm:mx-6 mb-12 sm:mb-16 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1400&q=85"
              alt="Montre de luxe"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="relative z-10 px-8 py-12 sm:py-20 max-w-lg">
            <p className="mb-3 inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              <Clock className="h-3 w-3" /> Offre limitée
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              Trouvez votre<br />
              <span className="gold-gradient-text">montre idéale</span>
            </h2>
            <p className="text-sm sm:text-base text-white/70 mb-7 max-w-sm">
              Des centaines de modèles disponibles. Livraison partout au Maroc. Paiement sécurisé.
            </p>
            <Link
              href="/shop"
              className="sheen sheen-dark inline-flex items-center gap-2 px-7 py-4 bg-gold-500 text-black text-base font-bold rounded-xl hover:bg-gold-400 active:scale-[0.97] transition-all"
            >
              Acheter maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* ── Services ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-12 sm:pb-16">
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" step={0.08}>
            {[
              { Icon: Shield,    title: "Authenticité garantie", desc: "Chaque pièce certifiée avec documentation complète" },
              { Icon: Truck,     title: "Livraison sécurisée",   desc: "Suivi en temps réel dans tout le Maroc" },
              { Icon: Award,     title: "Service premium",       desc: "Notre équipe d'experts à votre écoute" },
              { Icon: RefreshCw, title: "Retours 30 jours",      desc: "Échanges facilités sur toutes les commandes" },
            ].map(({ Icon, title, desc }) => (
              <StaggerItem key={title} className="group text-center p-4 sm:p-5 bg-white border border-luxury-border rounded-xl shadow-card hover:shadow-card-hover hover:border-gold-500/30 transition-all">
                <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-gold-500" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-luxury-white mb-1">{title}</h3>
                <p className="text-[11px] sm:text-xs text-luxury-muted leading-relaxed">{desc}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── Brand signature ───────────────────────────────────── */}
        <Reveal as="section" className="pb-14 sm:pb-20">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-5">
            <div className="rule-gold" />
            <LogoMark className="mt-3 h-14 w-auto" />
            <p className="font-serif text-lg font-bold text-luxury-white">
              {BRAND.nameLead}
              <span className="gold-text">{BRAND.nameTail}</span>
            </p>
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.38em] text-luxury-muted">
              {BRAND.claim}
            </p>
          </div>
        </Reveal>

      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
