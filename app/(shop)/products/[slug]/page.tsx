import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { addToCartAction } from "@/actions/cart";
import { toggleWishlistAction } from "@/actions/wishlist";
import { createReservationAction } from "@/actions/reservations";
import Button from "@/components/ui/Button";
import { ShoppingCart, Heart, Calendar, Shield, Award, ChevronRight, Truck, RotateCcw } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await db.product.findUnique({ where: { slug } });
    return { title: product?.name ?? "Produit introuvable" };
  } catch {
    return { title: "Produit indisponible" };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [product, user] = await Promise.all([
    db.product.findUnique({
      where: { slug, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
    }).catch(() => null),
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
    }).catch(() => null);
    inWishlist = (wishlist?.items.length ?? 0) > 0;
  }

  async function handleAddToCart(formData: FormData) {
    "use server";
    await addToCartAction(String(formData.get("productId") ?? ""));
  }
  async function handleBuyNow(formData: FormData) {
    "use server";
    await addToCartAction(String(formData.get("productId") ?? ""));
    redirect("/checkout");
  }
  async function handleToggleWishlist(formData: FormData) {
    "use server";
    await toggleWishlistAction(String(formData.get("productId") ?? ""));
  }
  async function handleReserve(formData: FormData) {
    "use server";
    await createReservationAction(formData);
  }

  const specs: [string, string | null][] = [
    ["Mouvement", product.movement],
    ["Boîtier", product.caseSize],
    ["Matériau", product.caseMaterial],
    ["Étanchéité", product.waterResist],
    ["Bracelet", product.strapMaterial],
  ];
  const hasSpecs = specs.some(([, v]) => v);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-luxury-muted mb-6 sm:mb-8">
        <Link href="/shop" className="hover:text-luxury-white transition-colors">Collection</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-luxury-white transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-luxury-light truncate max-w-[160px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* ── Images ── */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-luxury-dark border border-luxury-border">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-luxury-muted">⌚</div>
            )}
            {discount && discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-gold-500 text-black">
                  -{discount}%
                </span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square rounded-xl overflow-hidden bg-luxury-dark border border-luxury-border hover:border-gold-500/50 transition-colors cursor-pointer"
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.name}
                    width={120}
                    height={120}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-5">

          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-500">
              {product.brand}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-gold-500">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-base text-luxury-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-luxury-light leading-relaxed">
            {product.description}
          </p>

          {/* Specs */}
          {hasSpecs && (
            <div className="rounded-xl border border-luxury-border bg-luxury-dark p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-luxury-white mb-3">
                Caractéristiques
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {specs.filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-luxury-muted mb-0.5">{label}</p>
                    <p className="text-sm text-luxury-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 10 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-emerald-600 font-medium">En stock</span>
              </>
            ) : product.stock > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-amber-600 font-medium">Plus que {product.stock} en stock</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-luxury-muted" />
                <span className="text-sm text-luxury-muted">Hors stock</span>
              </>
            )}
          </div>

          {/* Actions */}
          {user ? (
            <div className="flex flex-col gap-2.5">
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

              <div className="grid grid-cols-2 gap-2.5">
                <form action={handleReserve}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button type="submit" variant="ghost" className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" /> Réserver
                  </Button>
                </form>

                <form action={handleToggleWishlist}>
                  <input type="hidden" name="productId" value={product.id} />
                  <Button type="submit" variant="ghost" className="w-full" size="lg">
                    <Heart className={`h-4 w-4 mr-2 ${inWishlist ? "fill-gold-500 text-gold-500" : ""}`} />
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
                <Link href="/register" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
                  créer un compte
                </Link>
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-luxury-border">
            {[
              { Icon: Shield, title: "Authenticité garantie", sub: "Certificat inclus" },
              { Icon: Award, title: "Garantie 2 ans", sub: "Service après-vente" },
              { Icon: Truck, title: "Livraison sécurisée", sub: "Partout au Maroc" },
              { Icon: RotateCcw, title: "Retours 30 jours", sub: "Échange facilité" },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-gold-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-luxury-white">{title}</p>
                  <p className="text-xs text-luxury-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
