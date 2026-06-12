import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { createReservationAction } from "@/actions/reservations";
import Button from "@/components/ui/Button";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductActions from "@/components/shop/ProductActions";
import { Shield, Award, ChevronRight, Truck, RotateCcw, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    if (!product) return { title: "Produit introuvable" };

    const description = product.description.slice(0, 160);
    const image = product.images[0]?.url;

    return {
      title: product.name,
      description,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        title: product.name,
        description,
        type: "website",
        ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
      },
    };
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: Number(product.price),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    /* Extra bottom padding on mobile for the sticky CTA bar */
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

        {/* ── Images (interactive gallery) ── */}
        <ProductGallery
          images={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            altText: i.altText,
            isPrimary: i.isPrimary,
          }))}
          productName={product.name}
          discount={discount}
        />

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

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            {product.stock > 10 ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm text-emerald-600 font-medium">En stock</span></>
            ) : product.stock > 0 ? (
              <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-sm text-amber-600 font-medium">Plus que {product.stock} en stock</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-luxury-muted" /><span className="text-sm text-luxury-muted">Hors stock</span></>
            )}
          </div>

          {/* Actions — client component handles both desktop + mobile sticky bar */}
          <ProductActions
            productId={product.id}
            productSlug={product.slug}
            inWishlist={inWishlist}
            inStock={product.stock > 0}
            isAuthenticated={!!user}
          />

          {/* Reserve — desktop only, secondary action */}
          {user && (
            <div className="hidden md:block -mt-1">
              <form action={handleReserve}>
                <input type="hidden" name="productId" value={product.id} />
                <Button type="submit" variant="ghost" className="w-full" size="lg">
                  <Calendar className="h-4 w-4 mr-2" /> Réserver une démonstration
                </Button>
              </form>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-luxury-border">
            {[
              { Icon: Shield, title: "Authenticité garantie", sub: "Certificat inclus" },
              { Icon: Award, title: "Garantie constructeur", sub: "Service après-vente" },
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
