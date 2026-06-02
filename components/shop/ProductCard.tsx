import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check, Gem, ImageIcon } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import type { Product, ProductImage } from "@prisma/client";

type ProductWithImage = Product & { images: ProductImage[] };

export default function ProductCard({ product }: { product: ProductWithImage }) {
  const sortedImages = [...product.images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
  const primaryImage = sortedImages[0];
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount = comparePrice && comparePrice > price
    ? Math.round((1 - price / comparePrice) * 100)
    : null;
  const isSoldOut = product.stock <= 0;
  const isLowStock = !isSoldOut && product.stock <= product.lowStockAt;
  const specs = [product.movement, product.caseSize].filter((value): value is string => Boolean(value));
  const detailSpecs = [
    product.caseMaterial,
    product.waterResist,
    product.strapMaterial,
  ].filter((value): value is string => Boolean(value));

  const badgeVariant: Record<string, "gold" | "gray"> = {
    hot: "gold",
    new: "gold",
    sale: "gold",
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={`Voir ${product.name}`}
      className="group block h-full rounded-[1.75rem] transition-transform duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-luxury-black"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#f8f8f6] text-[#1a1a1a] shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[#f8f8f6]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? primaryImage.alt ?? product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#f8f8f6] text-[#1a1a1a]/45">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
            </div>
          )}

          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            {product.badge && (
              <Badge variant={badgeVariant[product.badge] ?? "gold"} className="bg-white/90 text-[#1a1a1a] backdrop-blur">
                {product.badge.toUpperCase()}
              </Badge>
            )}
            {product.isFeatured && (
              <Badge variant="gold" className="bg-gold-500 text-[#1a1a1a]">
                Selection
              </Badge>
            )}
            {discount && (
              <Badge variant="gold" className="bg-gold-500 text-[#1a1a1a]">
                -{discount}%
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md sm:text-[11px]",
                isSoldOut
                  ? "border-white/20 bg-[#1a1a1a]/85 text-white"
                  : isLowStock
                    ? "border-gold-500/40 bg-white/90 text-[#1a1a1a]"
                    : "border-white/50 bg-white/90 text-[#1a1a1a]",
              )}
            >
              {!isSoldOut && <Check className="h-3 w-3 text-gold-500" aria-hidden="true" />}
              {isSoldOut ? "Hors stock" : isLowStock ? "Limite" : "Disponible"}
            </span>

            {sortedImages.length > 1 && (
              <span className="hidden rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#1a1a1a] backdrop-blur-md sm:inline-flex sm:text-[11px]">
                {sortedImages.length} photos
              </span>
            )}
          </div>

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/55">
              <span className="rounded-full border border-white/15 bg-[#1a1a1a]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Hors stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1a1a1a]/55 sm:text-[11px]">
              {product.brand ?? "Lux Watch"}
            </p>
            <Gem className="h-3.5 w-3.5 shrink-0 text-gold-500" aria-hidden="true" />
          </div>

          <h3 className="line-clamp-2 min-h-[2.4rem] text-[15px] font-semibold leading-tight text-[#1a1a1a] transition-colors group-hover:text-gold-700 sm:text-base">
            {product.name}
          </h3>

          {specs.length > 0 && (
            <p className="mt-2 truncate text-xs font-medium text-[#1a1a1a]/60">
              {specs.join(" / ")}
            </p>
          )}

          {detailSpecs.length > 0 && (
            <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
              {detailSpecs.slice(0, 2).map((spec) => (
                <span
                  key={spec}
                  className="max-w-full truncate rounded-full border border-[#1a1a1a]/10 bg-white px-2.5 py-1 text-[11px] font-medium text-[#1a1a1a]/65"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-base font-bold text-[#1a1a1a] sm:text-lg">
                {formatPrice(product.price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs font-medium text-[#1a1a1a]/45 line-through sm:text-sm">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-full border border-[#1a1a1a]/10 bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a] transition-colors group-hover:border-gold-500/50 group-hover:text-gold-700 sm:text-sm">
              <span>{isSoldOut ? "Voir details" : "Reserver"}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
