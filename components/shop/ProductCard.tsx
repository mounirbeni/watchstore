import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col active:scale-[0.98] transition-transform duration-150"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-luxury-border bg-white hover:shadow-card-hover transition-shadow duration-300">

        {/* Image — fixed 1:1 ratio across the whole store */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-luxury-dark">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-luxury-muted">
              <span className="text-3xl">⌚</span>
            </div>
          )}

          {/* Discount badge — fixed top-left */}
          {discount && discount > 0 && (
            <span className="absolute top-2.5 left-2.5 inline-flex items-center rounded-md bg-gold-500 px-2 py-0.5 text-xs font-semibold text-black shadow-sm">
              -{discount}%
            </span>
          )}

          {/* Product badge — fixed top-right */}
          {product.badge && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center rounded-md bg-luxury-white px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              {product.badge}
            </span>
          )}

          {/* Low-stock badge — fixed bottom-left */}
          {lowStock && (
            <span className="absolute bottom-2.5 left-2.5 inline-flex items-center rounded-md border border-luxury-border bg-white px-2 py-0.5 text-xs font-semibold text-luxury-light shadow-card">
              {product.stock} restant{product.stock > 1 ? "s" : ""}
            </span>
          )}

          {/* Out-of-stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="rounded-full border border-luxury-border bg-white px-3 py-1 text-xs font-semibold text-luxury-muted shadow-card">
                Hors stock
              </span>
            </div>
          )}
        </div>

        {/* Info — flex column with reserved space so every card is identical */}
        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          {/* Brand — always reserves one line */}
          <p className="mb-1 min-h-[14px] text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted sm:text-xs">
            {product.brand ?? " "}
          </p>

          {/* Name — clamped to exactly 2 lines */}
          <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-luxury-white">
            {product.name}
          </h3>

          {/* Price — pinned to the bottom of the info area */}
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-sm font-bold text-gold-500 sm:text-base">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-luxury-muted line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* CTA — styled span (card itself is the link) */}
          <span
            className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-luxury-dark text-luxury-muted"
                : "bg-luxury-white text-white group-hover:bg-gold-500 group-hover:text-black"
            }`}
          >
            {outOfStock ? (
              "Indisponible"
            ) : (
              <>
                Voir le produit
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </span>
        </div>
      </article>
    </Link>
  );
}
