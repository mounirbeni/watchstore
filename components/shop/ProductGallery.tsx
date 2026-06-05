"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
}

interface Props {
  images: GalleryImage[];
  productName: string;
  discount: number | null;
}

export default function ProductGallery({ images, productName, discount }: Props) {
  const primary = images.find((i) => i.isPrimary) ?? images[0] ?? null;
  const [activeId, setActiveId] = useState(primary?.id ?? null);
  const activeImg = images.find((i) => i.id === activeId) ?? primary;
  const activeIndex = images.findIndex((i) => i.id === activeId);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-luxury-dark border border-luxury-border">
        {activeImg ? (
          <Image
            src={activeImg.url}
            alt={activeImg.altText ?? productName}
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

        {/* Image count badge on mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 sm:hidden rounded-full bg-black/50 px-2 py-0.5">
            <span className="text-[11px] font-semibold text-white">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2.5">
          {images.map((img) => {
            const isActive = img.id === activeId;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveId(img.id)}
                className={`aspect-square rounded-xl overflow-hidden bg-luxury-dark border-2 transition-all active:scale-95 ${
                  isActive
                    ? "border-gold-500"
                    : "border-luxury-border hover:border-gold-500/50"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? productName}
                  width={120}
                  height={120}
                  className="object-cover w-full h-full"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
