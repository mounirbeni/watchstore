"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToCartAction } from "@/actions/cart";
import { toggleWishlistAction } from "@/actions/wishlist";
import { ShoppingCart, Heart, ShoppingBag, Loader2, Check } from "lucide-react";

interface Props {
  productId: string;
  productSlug: string;
  inWishlist: boolean;
  inStock: boolean;
  isAuthenticated: boolean;
}

export default function ProductActions({
  productId,
  productSlug,
  inWishlist: initialWishlist,
  inStock,
  isAuthenticated,
}: Props) {
  const router = useRouter();
  const [pendingCart, startCart] = useTransition();
  const [pendingBuy, startBuy] = useTransition();
  const [pendingWish, startWish] = useTransition();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlist);
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    startCart(async () => {
      await addToCartAction(productId);
      setJustAdded(true);
      router.refresh();
      setTimeout(() => setJustAdded(false), 2000);
    });
  }

  function handleBuyNow() {
    startBuy(async () => {
      await addToCartAction(productId);
      router.push("/checkout");
    });
  }

  function handleToggleWishlist() {
    startWish(async () => {
      setIsWishlisted((w) => !w);
      await toggleWishlistAction(productId);
      router.refresh();
    });
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden md:block space-y-2">
          <Link
            href={`/login?from=/products/${productSlug}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-luxury-white text-white text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <ShoppingCart className="h-4 w-4" /> Se connecter pour acheter
          </Link>
          <p className="text-xs text-luxury-muted text-center">
            Ou{" "}
            <Link href="/register" className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
              créer un compte
            </Link>
          </p>
        </div>

        {/* Mobile sticky bar */}
        <div className="md:hidden fixed bottom-[var(--mobile-nav-h)] left-0 right-0 z-40 border-t border-luxury-border bg-white px-4 py-3">
          <Link
            href={`/login?from=/products/${productSlug}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-luxury-white text-white text-sm font-bold py-3.5 active:scale-[0.98] transition-transform"
          >
            <ShoppingCart className="h-4 w-4" /> Se connecter pour acheter
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop inline buttons */}
      <div className="hidden md:flex flex-col gap-2.5">
        <button
          onClick={handleBuyNow}
          disabled={!inStock || pendingBuy}
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-luxury-white text-white text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 active:scale-[0.98]"
        >
          {pendingBuy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {!inStock ? "Hors stock" : pendingBuy ? "Redirection…" : "Acheter maintenant"}
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || pendingCart}
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border border-luxury-border text-luxury-white text-sm font-semibold transition-colors hover:border-luxury-white disabled:opacity-40"
        >
          {pendingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : null}
          {justAdded ? "Ajouté au panier !" : pendingCart ? "Ajout en cours…" : "Ajouter au panier"}
        </button>

        <button
          onClick={handleToggleWishlist}
          disabled={pendingWish}
          className={`flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-40 ${
            isWishlisted
              ? "border-gold-500/30 bg-gold-500/10 text-gold-500"
              : "border-luxury-border text-luxury-muted hover:border-luxury-white hover:text-luxury-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-gold-500" : ""}`} />
          {isWishlisted ? "Sauvegardé" : "Sauvegarder"}
        </button>
      </div>

      {/* Mobile sticky CTA bar — sits above the bottom tab bar */}
      <div className="md:hidden fixed bottom-[var(--mobile-nav-h)] left-0 right-0 z-40 border-t border-luxury-border bg-white px-4 py-3 flex gap-3">
        {/* Wishlist icon */}
        <button
          onClick={handleToggleWishlist}
          disabled={pendingWish}
          aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${
            isWishlisted
              ? "border-gold-500 bg-gold-500/10 text-gold-500"
              : "border-luxury-border text-luxury-muted"
          }`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? "fill-gold-500" : ""}`} />
        </button>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || pendingCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-luxury-border text-luxury-white text-sm font-semibold py-3 transition-all hover:border-luxury-white disabled:opacity-40 active:scale-[0.98]"
        >
          {pendingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShoppingBag className="h-4 w-4" />
          )}
          {justAdded ? "Ajouté !" : "Panier"}
        </button>

        {/* Buy now */}
        <button
          onClick={handleBuyNow}
          disabled={!inStock || pendingBuy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-luxury-white text-white text-sm font-bold py-3 transition-all hover:opacity-80 disabled:opacity-40 active:scale-[0.98]"
        >
          {pendingBuy && <Loader2 className="h-4 w-4 animate-spin" />}
          {!inStock ? "Hors stock" : pendingBuy ? "…" : "Acheter"}
        </button>
      </div>
    </>
  );
}
