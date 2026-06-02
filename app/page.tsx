import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import HeroCarousel from "@/components/home/HeroCarousel";
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

        {/* Hero carousel */}
        <HeroCarousel />

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
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="flex items-end justify-between mb-8 sm:mb-12 sm:text-center sm:block">
            <div className="sm:mb-0">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2 sm:mb-4">
                Nos <span className="gold-text">Collections</span>
              </h2>
              <p className="text-sm sm:text-base text-luxury-muted">Explorez nos catégories soigneusement sélectionnées</p>
            </div>
          </div>

          {categories.length === 0 ? (
            <p className="text-center text-sm text-luxury-muted">La collection sera disponible apres configuration de la base de donnees.</p>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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
        <section className="bg-luxury-dark py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex justify-between items-end mb-8 sm:mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-1 sm:mb-2">
                  Pièces <span className="gold-text">Vedettes</span>
                </h2>
                <p className="text-sm sm:text-base text-luxury-muted">Notre sélection exclusive du moment</p>
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

        {/* Services */}
        <section className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { Icon: Shield, title: "Authenticité garantie", desc: "Chaque pièce est certifiée et accompagnée de sa documentation" },
              { Icon: Truck, title: "Livraison sécurisée", desc: "Livraison assurée avec suivi en temps réel dans tout le Maroc" },
              { Icon: Award, title: "Service premium", desc: "Notre équipe d'experts est à votre disposition" },
              { Icon: RefreshCw, title: "Retours 30 jours", desc: "Échanges et retours facilités sur toutes les commandes" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="text-center p-5 sm:p-6 bg-luxury-card border border-luxury-border rounded-2xl hover:border-gold-500/30 transition-colors">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-gold-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2">{title}</h3>
                <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed">{desc}</p>
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
