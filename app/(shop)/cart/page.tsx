import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatPrice } from "@/lib/utils";
import { removeFromCartAction, updateCartQuantityAction } from "@/actions/cart";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { ShoppingCart, Trash2, ArrowRight, ChevronLeft } from "lucide-react";
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
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);

  async function removeItem(formData: FormData) {
    "use server";
    const id = String(formData.get("cartItemId") ?? "");
    await removeFromCartAction(id);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop" className="text-luxury-muted hover:text-gold-400 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-serif font-bold text-white">Mon Panier</h1>
        {items.length > 0 && (
          <span className="text-sm text-luxury-muted">({items.length} article{items.length > 1 ? "s" : ""})</span>
        )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const image = item.product.images[0];
              return (
                <div key={item.id} className="flex gap-4 bg-luxury-card border border-luxury-border rounded-xl p-4">
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-luxury-dark">
                    {image ? (
                      <Image src={image.url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">⌚</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="font-medium text-white hover:text-gold-400 transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-luxury-muted mt-0.5">{item.product.brand}</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <form action={decreaseQty}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity} />
                          <button type="submit" className="w-7 h-7 rounded border border-luxury-border text-luxury-light hover:border-gold-500 hover:text-gold-400 transition-colors text-sm">−</button>
                        </form>
                        <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                        <form action={increaseQty}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <input type="hidden" name="quantity" value={item.quantity} />
                          <input type="hidden" name="maxStock" value={item.product.stock} />
                          <button type="submit" className="w-7 h-7 rounded border border-luxury-border text-luxury-light hover:border-gold-500 hover:text-gold-400 transition-colors text-sm">+</button>
                        </form>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gold-400">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </span>
                        <form action={removeItem}>
                          <input type="hidden" name="cartItemId" value={item.id} />
                          <button type="submit" className="text-luxury-muted hover:text-red-400 transition-colors">
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

          <div className="lg:col-span-1">
            <div className="bg-luxury-card border border-luxury-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-6">Récapitulatif</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-muted">Sous-total</span>
                  <span className="text-luxury-light">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-muted">Livraison</span>
                  <span className="text-green-400">Gratuite</span>
                </div>
                <div className="pt-3 border-t border-luxury-border flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-gold-400 text-lg">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Passer la commande <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <p className="mt-4 text-xs text-luxury-muted text-center">
                Livraison sécurisée · Paiement chiffré · Retours 30 jours
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
