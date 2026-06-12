import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { Category, Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Collection" };

interface Props {
  searchParams: Promise<{ category?: string; sort?: string; q?: string; min?: string; max?: string }>;
}

/** Build a /shop href that preserves the currently active filters, applying overrides. */
function buildShopHref(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...base, ...overrides };
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;

  const parsePrice = (raw?: string): number | undefined => {
    if (raw === undefined) return undefined;
    const n = parseFloat(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const minPrice = parsePrice(params.min);
  const maxPrice = parsePrice(params.max);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.q ? { OR: [
      { name: { contains: params.q, mode: "insensitive" as const } },
      { brand: { contains: params.q, mode: "insensitive" as const } },
      { description: { contains: params.q, mode: "insensitive" as const } },
    ]} : {}),
    ...(minPrice !== undefined || maxPrice !== undefined ? {
      price: {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      }
    } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc"  ? { price: "asc" as const } :
    params.sort === "price-desc" ? { price: "desc" as const } :
                                   { createdAt: "desc" as const };

  type ListedProduct = Prisma.ProductGetPayload<{ include: { images: true; category: true } }>;
  let products: ListedProduct[] = [];
  let categories: Category[] = [];
  let total = 0;
  let databaseAvailable = true;

  try {
    [products, categories, total] = await Promise.all([
      db.product.findMany({ where, include: { images: { orderBy: { sortOrder: "asc" } }, category: true }, orderBy }),
      db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.product.count({ where }),
    ]);
  } catch {
    databaseAvailable = false;
  }

  const activeCategory = categories.find((c) => c.slug === params.category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-luxury-muted mb-3">
          <Link href="/" className="hover:text-luxury-white transition-colors">Accueil</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-luxury-white">Collection</span>
          {activeCategory && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-luxury-white">{activeCategory.name}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">
          {activeCategory?.name ?? "Toute la Collection"}
        </h1>
        <p className="text-sm text-luxury-muted mt-1">
          {total} pièce{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Mobile search */}
      <form method="GET" action="/shop" className="sm:hidden mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted" />
          <input
            name="q"
            type="search"
            defaultValue={params.q}
            placeholder="Rechercher une montre..."
            className="w-full bg-white border border-luxury-border text-luxury-white placeholder-luxury-muted rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
          />
        </div>
        {params.category && <input type="hidden" name="category" value={params.category} />}
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        {params.min && <input type="hidden" name="min" value={params.min} />}
        {params.max && <input type="hidden" name="max" value={params.max} />}
      </form>

      {/* Mobile category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-6 sm:hidden">
          <Link
            href={buildShopHref(params, { category: undefined })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !params.category
                ? "bg-luxury-white text-white border-luxury-white"
                : "bg-white text-luxury-muted border-luxury-border hover:border-luxury-white"
            }`}
          >
            Toutes
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildShopHref(params, { category: cat.slug })}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                params.category === cat.slug
                  ? "bg-luxury-white text-white border-luxury-white"
                  : "bg-white text-luxury-muted border-luxury-border hover:border-luxury-white"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-8">

        {/* Sidebar — desktop only */}
        <aside className="hidden sm:block w-56 shrink-0 space-y-5 sticky top-24 self-start">

          {/* Search */}
          <form method="GET" action="/shop">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted" />
              <input
                name="q"
                type="search"
                defaultValue={params.q}
                placeholder="Rechercher..."
                className="w-full bg-white border border-luxury-border text-luxury-white placeholder-luxury-muted rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
              />
            </div>
            {params.category && <input type="hidden" name="category" value={params.category} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.min && <input type="hidden" name="min" value={params.min} />}
            {params.max && <input type="hidden" name="max" value={params.max} />}
          </form>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-luxury-white mb-3 uppercase tracking-[0.18em]">
              Catégories
            </h3>
            <div className="space-y-0.5">
              <Link
                href={buildShopHref(params, { category: undefined })}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  !params.category
                    ? "bg-gold-500/10 text-gold-500 font-medium"
                    : "text-luxury-muted hover:text-luxury-white hover:bg-luxury-dark"
                }`}
              >
                <span>Toutes</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildShopHref(params, { category: cat.slug })}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    params.category === cat.slug
                      ? "bg-gold-500/10 text-gold-500 font-medium"
                      : "text-luxury-muted hover:text-luxury-white hover:bg-luxury-dark"
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="text-xs font-semibold text-luxury-white mb-3 uppercase tracking-[0.18em] flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3" /> Trier par
            </h3>
            <div className="space-y-0.5">
              {([
                ["newest", "Nouveautés"],
                ["price-asc", "Prix croissant"],
                ["price-desc", "Prix décroissant"],
              ] as [string, string][]).map(([value, label]) => (
                <Link
                  key={value}
                  href={buildShopHref(params, { sort: value })}
                  className={`flex px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    (params.sort === value || (!params.sort && value === "newest"))
                      ? "bg-gold-500/10 text-gold-500 font-medium"
                      : "text-luxury-muted hover:text-luxury-white hover:bg-luxury-dark"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div>
            <h3 className="text-xs font-semibold text-luxury-white mb-3 uppercase tracking-[0.18em]">
              Prix (MAD)
            </h3>
            <form method="GET" action="/shop" className="space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  name="min"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  defaultValue={params.min}
                  placeholder="Min"
                  className="w-full bg-white border border-luxury-border text-luxury-white placeholder-luxury-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
                />
                <span className="text-luxury-muted text-sm">–</span>
                <input
                  name="max"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  defaultValue={params.max}
                  placeholder="Max"
                  className="w-full bg-white border border-luxury-border text-luxury-white placeholder-luxury-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors"
                />
              </div>
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              {params.q && <input type="hidden" name="q" value={params.q} />}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-luxury-white text-white rounded-lg px-3 py-2 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Appliquer
                </button>
                {(params.min || params.max) && (
                  <Link
                    href={buildShopHref(params, { min: undefined, max: undefined })}
                    className="px-3 py-2 text-sm text-luxury-muted hover:text-luxury-white transition-colors"
                  >
                    Réinitialiser
                  </Link>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Desktop top bar */}
          <div className="hidden sm:flex items-center justify-between mb-5">
            <p className="text-sm text-luxury-muted">{total} résultat{total !== 1 ? "s" : ""}</p>
          </div>

          {!databaseAvailable ? (
            <EmptyState
              title="Collection indisponible"
              description="La base de données doit être configurée avant de publier la collection."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Aucun produit trouvé"
              description="Essayez d'autres critères ou explorez une autre catégorie."
              action={<Link href="/shop" className="text-sm text-gold-500 hover:text-gold-400 transition-colors font-medium">Voir tous les produits</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
