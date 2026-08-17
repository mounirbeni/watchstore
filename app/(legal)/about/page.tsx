import Link from "next/link";
import { db } from "@/lib/db";
import { ChevronLeft, Shield, Truck, Star, Users, Award, Heart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos – ChronoCraft" };
export const dynamic = "force-dynamic";

/** Counted rather than hardcoded, so the figure cannot outgrow the catalogue. */
async function getProductCount() {
  try {
    return await db.product.count({ where: { isActive: true } });
  } catch { return 0; }
}

const VALUES = [
  {
    Icon: Shield,
    title: "Qualité contrôlée",
    desc: "Fournisseurs et manufactures partenaires sélectionnés. Chaque montre inspectée avant expédition, garantie 12 mois.",
  },
  {
    Icon: Truck,
    title: "Livraison partout au Maroc",
    desc: "Nous expédions dans toutes les villes du royaume en 24 à 72 heures avec un suivi en temps réel.",
  },
  {
    Icon: Star,
    title: "Excellence du service",
    desc: "Notre équipe vous accompagne du lundi au samedi, de 9h à 18h, avant, pendant et après votre achat.",
  },
  {
    Icon: Heart,
    title: "Passion horlogère",
    desc: "Fondée par des passionnés, ChronoCraft sélectionne uniquement des pièces qui méritent votre poignet.",
  },
];

function buildStats(productCount: number) {
  return [
    { value: String(productCount), label: "Références en stock" },
    { value: "24-72h", label: "Délai de livraison" },
    { value: "12 mois", label: "Garantie sur chaque montre" },
    { value: "14 jours", label: "Droit de retour" },
  ];
}

export default async function AboutPage() {
  const STATS = buildStats(await getProductCount());

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-luxury-muted hover:text-luxury-white transition-colors mb-8"
      >
        <ChevronLeft className="h-4 w-4" /> Retour à l&apos;accueil
      </Link>

      {/* Hero */}
      <section className="mb-14 sm:mb-20">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
          Notre histoire
        </p>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-luxury-white leading-tight mb-6">
          L&apos;art du temps,<br />
          <span className="gold-text">livré chez vous.</span>
        </h1>
        <p className="text-base sm:text-lg text-luxury-muted leading-relaxed max-w-2xl">
          ChronoCraft est née d&apos;une conviction simple : chaque amateur de belles montres mérite un accès
          facile, sécurisé et transparent aux pièces qui lui correspondent. Depuis Casablanca, nous distribuons
          dans tout le Maroc des montres soigneusement sélectionnées auprès de nos fournisseurs partenaires.
        </p>
      </section>

      {/* Story */}
      <section className="mb-14 sm:mb-20 grid md:grid-cols-2 gap-10 sm:gap-16 items-center">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
            Qui sommes-nous ?
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-5">
            Une équipe de passionnés au service de votre style
          </h2>
          <div className="space-y-4 text-sm sm:text-[15px] text-luxury-muted leading-relaxed">
            <p>
              Fondée en 2022, ChronoCraft est une plateforme marocaine de distribution horlogère. Nous
              sélectionnons nos pièces auprès de manufactures et de fournisseurs partenaires, puis nous les
              distribuons partout au royaume — en assurant nous-mêmes le service après-vente et la garantie.
            </p>
            <p>
              Nous croyons que porter une belle montre est bien plus qu&apos;un accessoire — c&apos;est une
              expression de soi, un héritage, une émotion. C&apos;est pourquoi nous sommes aussi exigeants
              sur la sélection de nos pièces que vous l&apos;êtes sur votre choix.
            </p>
            <p>
              Notre modèle est simple et transparent : vous commandez en ligne, vous versez un petit acompte
              pour confirmer votre sérieux, et vous payez le reste à la livraison. Pas de surprise.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white border border-luxury-border rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-card"
            >
              <p className="text-3xl sm:text-4xl font-serif font-bold gold-text mb-1">{value}</p>
              <p className="text-xs text-luxury-muted leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-14 sm:mb-20">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
          Nos engagements
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-8">
          Ce qui nous distingue
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 p-5 bg-white border border-luxury-border rounded-2xl shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-gold-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-luxury-white mb-1">{title}</p>
                <p className="text-sm text-luxury-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Awards / Trust */}
      <section className="mb-14 sm:mb-20 bg-white border border-luxury-border rounded-2xl p-7 sm:p-10 shadow-card text-center">
        <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
          <Award className="h-6 w-6 text-gold-500" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-luxury-white mb-3">
          La confiance, au cœur de tout
        </h2>
        <p className="text-sm sm:text-base text-luxury-muted leading-relaxed max-w-xl mx-auto">
          Nous ne fabriquons pas nos montres : nous les distribuons. Elles proviennent de manufactures et de
          fournisseurs partenaires sélectionnés, avec lesquels nous travaillons dans la durée. Chaque pièce est
          contrôlée avant d&apos;intégrer notre catalogue, puis inspectée avant expédition — et couverte par
          notre garantie de 12 mois, que nous assurons nous-mêmes.
        </p>
      </section>

      {/* Team */}
      <section className="mb-14 sm:mb-20">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
          Notre équipe
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-8">
          Qui est derrière ChronoCraft
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Founder */}
          <div className="flex flex-col items-center text-center p-6 bg-white border border-luxury-border rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-lg font-bold text-gold-500 mb-3">
              MJ
            </div>
            <p className="text-sm font-semibold text-luxury-white">Mohammed J.</p>
            <p className="text-xs text-luxury-muted mt-1">Fondateur &amp; CEO</p>
          </div>

          {/* Technical partner */}
          <div className="flex flex-col items-center text-center p-6 bg-white border border-luxury-border rounded-2xl shadow-card">
            <div className="w-14 h-14 rounded-full bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-lg font-bold text-gold-500 mb-3">
              MBN
            </div>
            <p className="text-sm font-semibold text-luxury-white">Mbn Dev Co</p>
            <p className="text-xs text-luxury-muted mt-1">Partenaire technique</p>
            <a
              href="https://mbndev.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-gold-500 hover:underline"
            >
              mbndev.ma
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-10 sm:py-14 border-t border-luxury-border">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
          Prêt à commencer ?
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white mb-4">
          Trouvez la montre qui vous ressemble
        </h2>
        <p className="text-sm text-luxury-muted mb-7 max-w-md mx-auto">
          Parcourez notre catalogue soigneusement sélectionné et commandez en toute confiance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-luxury-white text-white text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <Users className="h-4 w-4" /> Découvrir la collection
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-luxury-border text-luxury-light text-sm font-semibold hover:text-luxury-white hover:border-luxury-white transition-colors"
          >
            Voir la FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
