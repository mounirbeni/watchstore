import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Search, SlidersHorizontal } from "lucide-react";
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

  const orderBy: Prisma.ProductOrderByWithRelationInput = params.sort === "price-asc"
    ? { price: "asc" as const }
    : params.sort === "price-desc"
    ? { price: "desc" as const }
    : params.sort === "newest"
    ? { createdAt: "desc" as const }
    : { createdAt: "desc" as const };

  type ListedProduct = Prisma.ProductGetPayload<{ include: { images: true } }>;
  let products: ListedProduct[] = [];
  let categories: Category[] = [];
  let total = 0;
  let databaseAvailable = true;

  try {
    [products, categories, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" } } },
        orderBy,
      }),
      db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      db.product.count({ where }),
    ]);
  } catch {
    databaseAvailable = false;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          {params.category
            ? categories.find((c) => c.slug === params.category)?.name ?? "Collection"
            : "Toute la Collection"}
        </h1>
        <p className="text-luxury-muted">{total} pièce{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          {/* Search */}
          <form method="GET" action="/shop">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-luxury-muted" />
              <input
                name="q"
                type="search"
                defaultValue={params.q}
                placeholder="Rechercher..."
                className="w-full bg-luxury-dark border border-luxury-border text-luxury-white placeholder-luxury-muted rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-colors"
              />
            </div>
            {params.category && <input type="hidden" name="category" value={params.category} />}
          </form>

          {/* Categories */}
          <div className="bg-luxury-card border border-luxury-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-luxury-light mb-3 uppercase tracking-wider">Catégories</h3>
            <div className="space-y-1">
              <Link
                href="/shop"
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!params.category ? "bg-gold-500/20 text-gold-400" : "text-luxury-muted hover:text-white hover:bg-luxury-border/50"}`}
              >
                Toutes
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.category === cat.slug ? "bg-gold-500/20 text-gold-400" : "text-luxury-muted hover:text-white hover:bg-luxury-border/50"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="bg-luxury-card border border-luxury-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-luxury-light mb-3 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3" /> Trier par
            </h3>
            <div className="space-y-1">
              {[
                ["newest", "Nouveautés"],
                ["price-asc", "Prix croissant"],
                ["price-desc", "Prix décroissant"],
              ].map(([value, label]) => (
                <Link
                  key={value}
                  href={`/shop?${new URLSearchParams({ ...(params.category ? { category: params.category } : {}), sort: value! })}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.sort === value ? "bg-gold-500/20 text-gold-400" : "text-luxury-muted hover:text-white hover:bg-luxury-border/50"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {!databaseAvailable ? (
            <EmptyState
              title="Collection indisponible"
              description="La base de donnees doit etre configuree avant de publier la collection."
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Aucun produit trouvé"
              description="Essayez d'autres critères de recherche ou explorez d'autres catégories."
              action={<Link href="/shop" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">Voir tous les produits</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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
