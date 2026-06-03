import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block active:scale-[0.98] transition-transform duration-150"
    >
      <div className="bg-white border border-luxury-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow duration-300">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-luxury-dark">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-luxury-muted">
              <span className="text-3xl">⌚</span>
            </div>
          )}

          {/* Discount badge */}
          {discount && discount > 0 && (
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gold-500 text-black">
                -{discount}%
              </span>
            </div>
          )}

          {/* Product badge */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5 mt-6">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-luxury-white text-white uppercase tracking-wide">
                {product.badge}
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-luxury-muted bg-white border border-luxury-border px-3 py-1 rounded-full shadow-card">
                Hors stock
              </span>
            </div>
          )}

          {/* Limited stock */}
          {product.stock > 0 && product.stock <= 3 && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-white border border-luxury-border text-luxury-light shadow-card">
                {product.stock} restant{product.stock > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5 sm:p-4">
          {product.brand && (
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-luxury-muted mb-1">
              {product.brand}
            </p>
          )}

          <h3 className="text-sm font-medium text-luxury-white leading-snug line-clamp-2 mb-2.5">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-gold-500">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-luxury-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
