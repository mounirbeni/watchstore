import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { OrderStatus, Role } from "@prisma/client";
import { ArrowRight, Shield, Truck, Award, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
  } catch {
    return [];
  }
}

async function getPlatformMetrics() {
  try {
    const [inventory, categoryCount, clientCount, deliveredOrders] = await Promise.all([
      db.product.aggregate({
        where: { isActive: true },
        _sum: { stock: true },
      }),
      db.category.count({ where: { isActive: true } }),
      db.user.count({ where: { role: Role.CUSTOMER, isActive: true } }),
      db.order.count({ where: { status: OrderStatus.DELIVERED } }),
    ]);

    return [
      { value: String(inventory._sum.stock ?? 0), label: "Pieces disponibles" },
      { value: String(categoryCount), label: "Collections actives" },
      { value: String(clientCount), label: "Clients inscrits" },
      { value: String(deliveredOrders), label: "Commandes livrees" },
    ];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, categories, metrics] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getPlatformMetrics(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-luxury-black/70 z-10" />
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=1400&q=90"
              alt="Luxury watch"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-gold-400 text-sm font-medium uppercase tracking-[0.3em] mb-4">
                Collection Exclusive
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
                L&apos;Art du
                <br />
                <span className="gold-text">Temps</span>
              </h1>
              <p className="text-lg text-luxury-light mb-8 leading-relaxed max-w-lg">
                Chaque pièce raconte une histoire d&apos;élégance et de précision. Découvrez notre collection de montres d&apos;exception.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-black font-semibold rounded-lg hover:bg-gold-400 transition-all duration-200 shadow-sm shadow-gold-500/30"
                >
                  Explorer la collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/shop?category=luxe"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-gold-500/50 text-gold-400 font-medium rounded-lg hover:bg-gold-500/10 transition-all duration-200"
                >
                  Haute Horlogerie
                </Link>
              </div>
            </div>
          </div>
        </section>

        {metrics.length > 0 && (
          <section className="border-y border-luxury-border bg-luxury-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {metrics.map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-serif font-bold gold-text mb-1">{s.value}</p>
                    <p className="text-sm text-luxury-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Nos <span className="gold-text">Collections</span>
            </h2>
            <p className="text-luxury-muted">Explorez nos catégories soigneusement sélectionnées</p>
          </div>

          {categories.length === 0 ? (
            <p className="text-center text-sm text-luxury-muted">La collection sera disponible apres configuration de la base de donnees.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-luxury-card border border-luxury-border hover:border-gold-500/50 transition-all duration-300"
                >
                  {cat.imageUrl && (
                    <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-serif font-semibold text-lg">{cat.name}</h3>
                    <p className="text-gold-400 text-xs">{cat._count.products} pieces</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section className="bg-luxury-dark py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
                  Pièces <span className="gold-text">Vedettes</span>
                </h2>
                <p className="text-luxury-muted">Notre sélection exclusive du moment</p>
              </div>
              <Link href="/shop" className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors">
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {featured.length === 0 ? (
              <p className="text-luxury-muted text-center py-12">La collection arrive bientôt.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Shield, title: "Authenticité garantie", desc: "Chaque pièce est certifiée et accompagnée de sa documentation" },
              { Icon: Truck, title: "Livraison sécurisée", desc: "Livraison assurée avec suivi en temps réel dans tout le Maroc" },
              { Icon: Award, title: "Service premium", desc: "Notre équipe d'experts est à votre disposition" },
              { Icon: RefreshCw, title: "Retours 30 jours", desc: "Échanges et retours facilités sur toutes les commandes" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="text-center p-6 bg-luxury-card border border-luxury-border rounded-xl hover:border-gold-500/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-luxury-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
