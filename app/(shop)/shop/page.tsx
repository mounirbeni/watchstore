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

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.q ? { OR: [
      { name: { contains: params.q, mode: "insensitive" as const } },
      { brand: { contains: params.q, mode: "insensitive" as const } },
      { description: { contains: params.q, mode: "insensitive" as const } },
    ]} : {}),
    ...(params.min || params.max ? {
      price: {
        ...(params.min ? { gte: parseFloat(params.min) } : {}),
        ...(params.max ? { lte: parseFloat(params.max) } : {}),
      }
    } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc"  ? { price: "asc" as const } :
    params.sort === "price-desc" ? { price: "desc" as const } :
                                   { createdAt: "desc" as const };

  type ListedProduct = Prisma.ProductGetPayload<{ include: { images: true } }>;
  let products: ListedProduct[] = [];
  let categories: Category[] = [];
  let total = 0;
  let databaseAvailable = true;

  try {
    [products, categories, total] = await Promise.all([
      db.product.findMany({ where, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy }),
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

      {/* Mobile category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-6 sm:hidden">
          <Link
            href="/shop"
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
              href={`/shop?category=${cat.slug}`}
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
          </form>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-luxury-white mb-3 uppercase tracking-[0.18em]">
              Catégories
            </h3>
            <div className="space-y-0.5">
              <Link
                href="/shop"
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
                  href={`/shop?category=${cat.slug}`}
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
                  href={`/shop?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), sort: value })}`}
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
