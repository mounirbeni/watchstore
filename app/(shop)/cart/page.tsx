import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { removeFromCartAction, updateCartQuantityAction } from "@/actions/cart";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ShoppingCart, Trash2, ArrowRight, ChevronLeft, Shield, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/login?from=/cart");
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.userId },
    include: {
      items: {
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  async function removeItem(formData: FormData) {
    "use server";
    await removeFromCartAction(String(formData.get("cartItemId") ?? ""));
  }
  async function decreaseQty(formData: FormData) {
    "use server";
    const id = String(formData.get("cartItemId") ?? "");
    const qty = Number(formData.get("quantity") ?? 1);
    await updateCartQuantityAction(id, Math.max(1, qty - 1));
  }
  async function increaseQty(formData: FormData) {
    "use server";
    const id = String(formData.get("cartItemId") ?? "");
    const qty = Number(formData.get("quantity") ?? 1);
    const max = Number(formData.get("maxStock") ?? 99);
    await updateCartQuantityAction(id, Math.min(max, qty + 1));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop" className="p-2 -ml-2 text-luxury-muted hover:text-luxury-white transition-colors rounded-lg hover:bg-luxury-dark">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-luxury-white">Mon Panier</h1>
          {items.length > 0 && (
            <p className="text-sm text-luxury-muted mt-0.5">{items.length} article{items.length > 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8" />}
          title="Votre panier est vide"
          description="Découvrez notre collection et ajoutez des pièces qui vous inspirent."
          action={
            <Link href="/shop">
              <Button>Explorer la collection</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const image = item.product.images[0];
              return (
                <div key={item.id} className="flex gap-4 bg-white border border-luxury-border rounded-xl p-4 shadow-card">
                  <Link href={`/products/${item.product.slug}`} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-luxury-dark border border-luxury-border">
                    {image ? (
                      <Image src={image.url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">⌚</div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="font-semibold text-luxury-white hover:text-gold-500 transition-colors text-sm line-clamp-2">
                      {item.product.name}
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-luxury-muted mt-0.5 uppercase tracking-wide">{item.product.brand}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <form action={decreaseQty}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity} />
                          <button type="submit" className="w-8 h-8 rounded-lg border border-luxury-border text-luxury-light hover:border-luxury-white hover:text-luxury-white transition-colors text-base font-medium bg-white">−</button>
                        </form>
                        <span className="w-8 text-center text-sm font-semibold text-luxury-white">{item.quantity}</span>
                        <form action={increaseQty}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity} />
                          <input type="hidden" name="maxStock" value={item.product.stock} />
                          <button type="submit" className="w-8 h-8 rounded-lg border border-luxury-border text-luxury-light hover:border-luxury-white hover:text-luxury-white transition-colors text-base font-medium bg-white">+</button>
                        </form>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-luxury-white text-sm">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </span>
                        <form action={removeItem}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <button type="submit" className="p-1.5 text-luxury-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-luxury-border rounded-xl p-5 shadow-card sticky top-24">
              <h2 className="text-base font-semibold text-luxury-white mb-5">Récapitulatif</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-muted">Sous-total</span>
                  <span className="text-luxury-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-muted">Livraison</span>
                  <span className="text-emerald-600 font-medium">Gratuite</span>
                </div>
                <div className="pt-3 border-t border-luxury-border flex justify-between items-baseline">
                  <span className="font-semibold text-luxury-white">Total</span>
                  <span className="font-bold text-gold-500 text-xl">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Passer la commande <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-luxury-muted">
                  <Shield className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                  <span>Paiement sécurisé et chiffré</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-luxury-muted">
                  <Truck className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                  <span>Livraison partout au Maroc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
