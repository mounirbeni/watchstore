import type { Product, Category } from "@prisma/client";

/**
 * Card display signals. Rating and sold count are REAL admin-controlled
 * values stored on the product — never generated or hardcoded. Category,
 * stock urgency and the single trust badge are derived from real fields.
 */

/** Format a raw count into "78", "350", "1.5K", "2.3K". */
export function formatSold(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

export interface ProductSignals {
  categoryLabel: string;
  showRating: boolean;
  rating: number;        // 0–5, 1 decimal
  showSold: boolean;
  soldLabel: string;     // e.g. "1.5K vendus"
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
  const slug = product.category?.slug;

  // ── Category label ──────────────────────────────────────────────
  const categoryLabel =
    (slug && CATEGORY_LABELS[slug]) ||
    product.category?.name ||
    product.brand ||
    "Montre";

  // ── Rating (admin value) — hidden when 0 / empty ────────────────
  const rating = Math.max(0, Math.min(5, Number(product.rating) || 0));
  const showRating = rating > 0;

  // ── Sold count (admin value) — hidden when 0 / empty ────────────
  const sold = Math.max(0, Number(product.soldCount) || 0);
  const showSold = sold > 0;

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

  // ── One trust badge, by priority (uses real fields) ─────────────
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  let trustBadge: string | null = null;
  if (slug === "limited-edition") trustBadge = "Édition limitée";
  else if (product.isFeatured) trustBadge = "Meilleure vente";
  else if (isNew) trustBadge = "Nouveauté";
  else if (sold >= 500) trustBadge = "Choix populaire";
  else trustBadge = "Livraison rapide";

  return {
    categoryLabel,
    showRating,
    rating,
    showSold,
    soldLabel: `${formatSold(sold)} vendus`,
    stock,
    trustBadge,
  };
}
