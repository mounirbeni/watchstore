import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import HeroCarousel from "@/components/home/HeroCarousel";
import {
  ArrowRight, Shield, Truck, Award, RefreshCw,
  Zap, Star, Quote, CheckCircle2, Clock, Gem,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getNewArrivals() {
  try {
    return await db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
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


const TESTIMONIALS = [
  {
    name: "Youssef B.",
    city: "Casablanca",
    stars: 5,
    text: "Montre reçue en 48h, emballage luxueux et qualité au rendez-vous. Je recommande à 100%.",
  },
  {
    name: "Amine K.",
    city: "Rabat",
    stars: 5,
    text: "Service client impeccable. Ils m'ont aidé à choisir le modèle parfait pour mon budget.",
  },
  {
    name: "Mehdi R.",
    city: "Marrakech",
    stars: 5,
    text: "La montre est encore plus belle en vrai qu'en photo. Rapport qualité-prix exceptionnel.",
  },
  {
    name: "Khalid T.",
    city: "Fès",
    stars: 5,
    text: "Troisième achat ici, toujours aussi satisfait. Ma référence pour l'horlogerie au Maroc.",
  },
];

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* ── Hero carousel ─────────────────────────────────────── */}
        <HeroCarousel />

        {/* ── Flash promo banner ────────────────────────────────── */}
        <section className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-center gap-3 flex-wrap text-center">
            <Zap className="h-4 w-4 text-black shrink-0" />
            <p className="text-black text-sm font-bold">
              Livraison gratuite dès 800 MAD · Paiement en plusieurs fois disponible
            </p>
            <Link
              href="/shop"
              className="shrink-0 text-xs font-bold text-black underline underline-offset-2 hover:no-underline"
            >
              Voir les offres →
            </Link>
          </div>
        </section>


        {/* ── Categories ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 pt-12 pb-10 sm:py-20">
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-1.5">Explorer</p>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                Nos <span className="gold-text">Collections</span>
              </h2>
            </div>
            <Link href="/shop" className="shrink-0 text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="text-center text-sm text-luxury-muted">Bientôt disponible.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 md:grid-cols-4 sm:gap-4 sm:overflow-visible">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative shrink-0 w-[42%] sm:w-auto aspect-[3/4] sm:aspect-square overflow-hidden rounded-2xl bg-luxury-card border border-luxury-border hover:border-gold-500/50 transition-all duration-300 snap-start"
                >
                  {cat.imageUrl && (
                    <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width:640px) 42vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-serif font-semibold text-base sm:text-lg">{cat.name}</h3>
                    <p className="text-gold-400 text-xs mt-0.5">{cat._count.products} pièces</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Featured Products ─────────────────────────────────── */}
        <section className="bg-luxury-dark py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex justify-between items-end mb-6 sm:mb-10">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-1.5">Sélection</p>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                  Pièces <span className="gold-text">Vedettes</span>
                </h2>
              </div>
              <Link href="/shop" className="shrink-0 text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {featured.length === 0 ? (
              <p className="text-luxury-muted text-center py-12">La collection arrive bientôt.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
                {featured.map((p) => (
                  <div key={p.id} className="shrink-0 w-[68%] sm:w-auto snap-start">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Editorial / Brand Story ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-20">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center">
            {/* Image side */}
            <div className="relative aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden bg-luxury-dark">
              <Image
                src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=900&q=90"
                alt="Artisanat horloger"
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <span className="inline-flex items-center gap-1.5 bg-gold-500 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  <Gem className="h-3 w-3" /> Artisanat d&apos;exception
                </span>
              </div>
            </div>

            {/* Text side */}
            <div className="flex flex-col justify-center gap-6">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">Notre Histoire</p>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight mb-4">
                  L&apos;excellence<br />
                  <span className="gold-text">à portée de main</span>
                </h2>
                <p className="text-sm sm:text-base text-luxury-muted leading-relaxed">
                  Chaque montre de notre collection est sélectionnée avec soin pour allier esthétique raffinée, mécanique fiable et prix accessible. Nous croyons que le luxe ne devrait pas être un privilège.
                </p>
              </div>

              <div className="flex flex-col gap-3">
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
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 self-start px-6 py-3.5 bg-gold-500 text-black text-sm font-bold rounded-2xl hover:bg-gold-400 active:scale-[0.98] transition-all shadow-lg shadow-gold-500/20"
              >
                Découvrir la collection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── New Arrivals ──────────────────────────────────────── */}
        {newArrivals.length > 0 && (
          <section className="bg-luxury-dark py-12 sm:py-20">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
              <div className="flex justify-between items-end mb-6 sm:mb-10">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-1.5">Vient d&apos;arriver</p>
                  <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
                    Nouvelles <span className="gold-text">Arrivées</span>
                  </h2>
                </div>
                <Link href="/shop" className="shrink-0 text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
                {newArrivals.map((p) => (
                  <div key={p.id} className="shrink-0 w-[68%] sm:w-auto snap-start">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimonials ──────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-2">Avis clients</p>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
              Ce qu&apos;ils <span className="gold-text">disent</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
              ))}
              <span className="ml-2 text-sm text-luxury-muted">4.9 / 5 · 200+ avis</span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 sm:overflow-visible">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="shrink-0 w-[80%] sm:w-auto snap-start bg-luxury-card border border-luxury-border rounded-2xl p-5 flex flex-col gap-3 hover:border-gold-500/30 transition-colors"
              >
                <Quote className="h-5 w-5 text-gold-500/60" />
                <p className="text-sm text-luxury-light leading-relaxed flex-1">{t.text}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-luxury-border pt-3">
                  <div className="h-8 w-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-400">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-luxury-muted">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────── */}
        <section className="mx-4 sm:mx-6 mb-12 sm:mb-20 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1526045431048-f857369baa09?w=1400&q=85"
              alt="Montre de luxe"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/90 via-luxury-black/70 to-luxury-black/30" />
          <div className="relative z-10 px-8 py-14 sm:py-20 max-w-lg">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-400 mb-3 flex items-center gap-2">
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
              className="inline-flex items-center gap-2 px-7 py-4 bg-gold-500 text-black text-base font-bold rounded-2xl hover:bg-gold-400 active:scale-[0.97] transition-all shadow-xl shadow-gold-500/30"
            >
              Acheter maintenant <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── Services ──────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 pb-14 sm:pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { Icon: Shield, title: "Authenticité garantie", desc: "Chaque pièce certifiée avec documentation complète" },
              { Icon: Truck, title: "Livraison sécurisée", desc: "Suivi en temps réel dans tout le Maroc" },
              { Icon: Award, title: "Service premium", desc: "Notre équipe d'experts à votre écoute" },
              { Icon: RefreshCw, title: "Retours 30 jours", desc: "Échanges facilités sur toutes les commandes" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="text-center p-4 sm:p-6 bg-luxury-card border border-luxury-border rounded-2xl hover:border-gold-500/30 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold-500/15 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gold-400" />
                </div>
                <h3 className="text-xs sm:text-base font-semibold text-white mb-1.5">{title}</h3>
                <p className="text-[11px] sm:text-sm text-luxury-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
