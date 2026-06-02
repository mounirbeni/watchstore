import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { addToCartAction } from "@/actions/cart";
import { toggleWishlistAction } from "@/actions/wishlist";
import { createReservationAction } from "@/actions/reservations";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ShoppingCart, Heart, Calendar, Shield, Award, ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Produit introuvable" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [product, user] = await Promise.all([
    db.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
    }),
    getCurrentUser(),
  ]);

  if (!product) notFound();

  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  let inWishlist = false;
  if (user) {
    const wishlist = await db.wishlist.findUnique({
      where: { userId: user.userId },
      include: { items: { where: { productId: product.id } } },
    });
    inWishlist = (wishlist?.items.length ?? 0) > 0;
  }

  const badgeVariant: Record<string, "gold" | "green" | "red" | "orange"> = {
    hot: "red",
    new: "green",
    sale: "orange",
  };

  async function handleAddToCart(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") ?? "");
    await addToCartAction(productId);
  }

  async function handleBuyNow(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") ?? "");
    await addToCartAction(productId);
    redirect("/checkout");
  }

  async function handleToggleWishlist(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") ?? "");
    await toggleWishlistAction(productId);
  }

  async function handleReserve(formData: FormData) {
    "use server";
    await createReservationAction(formData);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-luxury-muted mb-8">
        <Link href="/shop" className="flex items-center gap-1 hover:text-gold-400 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Collection
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-gold-400 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-luxury-light">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-luxury-card border border-luxury-border">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={primaryImage.alt ?? product.name} fill className="object-cover" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-luxury-muted">⌚</div>
            )}
            {product.badge && (
              <div className="absolute top-4 left-4">
                <Badge variant={badgeVariant[product.badge] ?? "gold"}>{product.badge.toUpperCase()}</Badge>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-luxury-card border border-luxury-border hover:border-gold-500/50 transition-colors cursor-pointer">
                  <Image src={img.url} alt={img.alt ?? product.name} width={120} height={120} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-2">{product.brand}</p>
          )}
          <h1 className="text-3xl font-serif font-bold text-white mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gold-400">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-lg text-luxury-muted line-through">{formatPrice(product.comparePrice)}</span>
                <Badge variant="orange">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="text-luxury-light leading-relaxed mb-8">{product.description}</p>

          {(product.movement || product.caseSize || product.caseMaterial || product.waterResist) && (
            <div className="bg-luxury-dark border border-luxury-border rounded-xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-luxury-light mb-4 uppercase tracking-wider">Caractéristiques</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Mouvement", product.movement],
                  ["Boîtier", product.caseSize],
                  ["Matériau", product.caseMaterial],
                  ["Étanchéité", product.waterResist],
                  ["Bracelet", product.strapMaterial],
                ] as [string, string | null][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-luxury-muted mb-0.5">{label}</p>
                    <p className="text-sm text-luxury-light font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 10 ? (
              <><span className="w-2 h-2 rounded-full bg-green-400" /><span className="text-sm text-green-400">En stock ({product.stock} disponibles)</span></>
            ) : product.stock > 0 ? (
              <><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-sm text-orange-400">Stock limité ({product.stock} restants)</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-sm text-red-400">Hors stock</span></>
            )}
          </div>

          {user ? (
            <div className="flex flex-col gap-3">
              <form action={handleBuyNow}>
                <input type="hidden" name="productId" value={product.id} />
                <Button type="submit" className="w-full" size="lg" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Hors stock" : "Acheter maintenant"}
                </Button>
              </form>

              <form action={handleAddToCart}>
                <input type="hidden" name="productId" value={product.id} />
                <Button type="submit" variant="outline" className="w-full" size="lg" disabled={product.stock === 0}>
                  Ajouter au panier
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-3">
                <form action={handleReserve}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button type="submit" variant="outline" className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" /> Réserver
                  </Button>
                </form>

                <form action={handleToggleWishlist}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button type="submit" variant="ghost" className="w-full" size="lg">
                    <Heart className={`h-4 w-4 mr-2 ${inWishlist ? "fill-gold-400 text-gold-400" : ""}`} />
                    {inWishlist ? "Sauvegardé" : "Wishlist"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Link href={`/login?from=/products/${product.slug}`}>
                <Button className="w-full" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Se connecter pour acheter
                </Button>
              </Link>
              <p className="text-xs text-luxury-muted text-center">
                Ou{" "}
                <Link href="/register" className="text-gold-400 hover:text-gold-300 transition-colors">créer un compte</Link>
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-luxury-border grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gold-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-luxury-light">Authenticité garantie</p>
                <p className="text-xs text-luxury-muted">Certificat inclus</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-gold-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-luxury-light">Garantie 2 ans</p>
                <p className="text-xs text-luxury-muted">Service après-vente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
