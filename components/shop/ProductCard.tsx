import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  const badgeVariant: Record<string, "gold" | "gray"> = {
    hot: "gold",
    new: "gold",
    sale: "gold",
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block active:scale-[0.98] transition-transform duration-200">
      <div className="bg-luxury-card border border-luxury-border rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-luxury-dark">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? primaryImage.alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-luxury-muted">
              <span className="text-sm">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.badge && (
              <Badge variant={badgeVariant[product.badge] ?? "gold"}>
                {product.badge.toUpperCase()}
              </Badge>
            )}
            {discount && <Badge variant="gold">-{discount}%</Badge>}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-sm font-medium text-luxury-muted bg-luxury-dark/80 px-3 py-1 rounded-full">
                Hors stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-luxury-muted mb-1 uppercase tracking-widest">{product.brand}</p>
          )}
          <h3 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>

          {product.movement && (
            <p className="text-xs text-luxury-muted mb-3">{product.movement} · {product.caseSize}</p>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-gold-400">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-luxury-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
