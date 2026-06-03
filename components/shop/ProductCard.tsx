import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { getProductSignals } from "@/lib/product-signals";
import { ArrowRight, Star, Truck, Award, Sparkles, Flame, Gem } from "lucide-react";
import type { Product, ProductImage, Category } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[]; category?: Category | null };

const TRUST_ICON: Record<string, typeof Truck> = {
  "Livraison rapide": Truck,
  "Meilleure vente": Award,
  "Nouveauté": Sparkles,
  "Choix populaire": Flame,
  "Édition limitée": Gem,
};

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;
  const outOfStock = product.stock === 0;

  const signals = getProductSignals(product);
  const TrustIcon = signals.trustBadge ? (TRUST_ICON[signals.trustBadge] ?? Truck) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col active:scale-[0.98] transition-transform duration-150"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-luxury-border bg-white hover:shadow-card-hover transition-shadow duration-300">

        {/* Image — fixed 1:1 ratio across the whole store */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-luxury-dark">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-luxury-muted">
              <span className="text-3xl">⌚</span>
            </div>
          )}

          {/* Trust badge — single, top-left, subtle gold-on-white */}
          {signals.trustBadge && !outOfStock && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-gold-500/30 bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-luxury-white shadow-sm backdrop-blur-sm">
              {TrustIcon && <TrustIcon className="h-3 w-3 text-gold-500" />}
              {signals.trustBadge}
            </span>
          )}

          {/* Discount — top-right, gold */}
          {discount && discount > 0 && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center rounded-md bg-gold-500 px-2 py-0.5 text-xs font-semibold text-black shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Out-of-stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="rounded-full border border-luxury-border bg-white px-3 py-1 text-xs font-semibold text-luxury-muted shadow-card">
                Épuisé
              </span>
            </div>
          )}
        </div>

        {/* Info — fixed-slot column so every card is identical height */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">

          {/* 1 — Category (small, subtle) */}
          <p className="mb-1 min-h-[14px] text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted sm:text-[11px]">
            {signals.categoryLabel}
          </p>

          {/* 2 — Product name (max 2 lines) */}
          <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-luxury-white">
            {product.name}
          </h3>

          {/* 3 — Rating (only if reviews) + sold count */}
          <div className="mb-2 flex min-h-[16px] items-center gap-2 text-[11px] text-luxury-muted">
            {signals.hasReviews && (
              <span className="inline-flex items-center gap-0.5 font-medium text-luxury-light">
                <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                {signals.rating.toFixed(1)}
                <span className="ml-0.5 text-luxury-muted">({signals.reviewCount})</span>
              </span>
            )}
            {signals.hasReviews && <span className="text-luxury-border">·</span>}
            <span>{signals.soldLabel}</span>
          </div>

          {/* 4 — Stock status (gold accent, never red) */}
          <div className="mb-3 min-h-[18px]">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                signals.stock.tone === "gold"
                  ? "text-gold-500"
                  : signals.stock.tone === "out"
                    ? "text-luxury-muted"
                    : "text-luxury-light"
              }`}
            >
              {signals.stock.tone === "gold" && (
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              )}
              {signals.stock.label}
            </span>
          </div>

          {/* 5 — Price (pinned to bottom) */}
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-base font-bold text-gold-500">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-luxury-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
            {discount && discount > 0 && (
              <span className="ml-auto text-[11px] font-semibold text-luxury-light">
                Économisez {discount}%
              </span>
            )}
          </div>

          {/* 6 — Action button */}
          <span
            className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-luxury-dark text-luxury-muted"
                : "bg-luxury-white text-white group-hover:bg-gold-500 group-hover:text-black"
            }`}
          >
            {outOfStock ? (
              "Indisponible"
            ) : (
              <>
                Voir le produit
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </span>
        </div>
      </article>
    </Link>
  );
}
