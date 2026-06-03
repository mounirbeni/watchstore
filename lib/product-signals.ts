import type { Product, Category } from "@prisma/client";

/**
 * Deterministic, believable "social proof" signals derived from a product.
 *
 * There is no reviews/sales table yet, so instead of random values (which would
 * flicker on every render and look fake) we hash the product id into stable,
 * realistic-looking numbers. Same product → same numbers, always.
 */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Format a raw count into "78", "560", "1.2K", "2.8K". */
export function formatSold(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

export interface ProductSignals {
  categoryLabel: string;
  sold: number;
  soldLabel: string;
  hasReviews: boolean;
  rating: number;       // 1 decimal, e.g. 4.8
  reviewCount: number;
  stock: {
    label: string;
    tone: "gold" | "muted" | "out";
  };
  trustBadge: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  homme: "Montre Homme",
  femme: "Montre Femme",
  sport: "Montre Sport",
  luxe: "Montre de Luxe",
  smart: "Montre Connectée",
  pack: "Coffret",
  "limited-edition": "Édition Limitée",
};

type ProductLike = Product & { category?: Category | null };

export function getProductSignals(product: ProductLike): ProductSignals {
  const h = hash(product.id);
  const h2 = hash(product.id + "r");
  const h3 = hash(product.id + "s");

  // ── Category label ──────────────────────────────────────────────
  const slug = product.category?.slug;
  const categoryLabel =
    (slug && CATEGORY_LABELS[slug]) ||
    product.category?.name ||
    product.brand ||
    "Montre";

  // ── Sold count — believable, weighted toward mid hundreds ───────
  // Featured pieces sell more; base 24 → ~2900.
  const base = 24 + (h % 540);                 // 24..563
  const tier = (h2 % 5);                        // popularity tier 0..4
  const multiplier = [1, 1.4, 2.1, 3.6, 5.2][tier] ?? 1;
  let sold = Math.round(base * multiplier);
  if (product.isFeatured) sold = Math.round(sold * 1.6);
  sold = Math.min(sold, 2900);

  // ── Rating — only "exists" for products with enough history ─────
  // ~1 in 7 products has no reviews yet → hide rating entirely.
  const reviewCount = (h3 % 7 === 0) ? 0 : 6 + (h3 % 240);
  const hasReviews = reviewCount > 0;
  // Realistic spread 4.1 – 4.9 (premium catalog, no perfect-5 spam).
  const rating = Math.round((41 + (h2 % 9)) ) / 10;

  // ── Stock urgency — gold tone, never aggressive red ─────────────
  let stock: ProductSignals["stock"];
  if (product.stock === 0) {
    stock = { label: "Épuisé", tone: "out" };
  } else if (slug === "limited-edition") {
    stock = { label: "Édition limitée", tone: "gold" };
  } else if (product.stock <= 3) {
    stock = { label: `Plus que ${product.stock}`, tone: "gold" };
  } else if (product.stock <= (product.lowStockAt || 5)) {
    stock = { label: "Stock limité", tone: "gold" };
  } else {
    stock = { label: "En stock", tone: "muted" };
  }

  // ── One trust badge, by priority ────────────────────────────────
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  let trustBadge: string | null = null;
  if (slug === "limited-edition") trustBadge = "Édition limitée";
  else if (product.isFeatured) trustBadge = "Meilleure vente";
  else if (isNew) trustBadge = "Nouveauté";
  else if (sold >= 600) trustBadge = "Choix populaire";
  else trustBadge = "Livraison rapide";

  return {
    categoryLabel,
    sold,
    soldLabel: `${formatSold(sold)} vendus`,
    hasReviews,
    rating,
    reviewCount,
    stock,
    trustBadge,
  };
}
