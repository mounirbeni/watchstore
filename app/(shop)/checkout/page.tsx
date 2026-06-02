"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import { CreditCard, Banknote, Package, Bitcoin, MapPin, Plus } from "lucide-react";

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl: string | null;
}

interface CheckoutData {
  addresses: Address[];
  cartItems: CartItem[];
  subtotal: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  useEffect(() => {
    fetch("/api/checkout-data")
      .then((r) => r.json())
      .then((d: CheckoutData) => {
        setData(d);
        const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
        if (def) setSelectedAddress(def.id);
        setLoading(false);
      })
      .catch(() => router.push("/cart"));
  }, [router]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createOrderAction(formData);
      return result;
    },
    null,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || data.cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-luxury-muted">Votre panier est vide.</p>
        <a href="/shop" className="text-gold-400 mt-4 inline-block hover:text-gold-300 transition-colors">
          Continuer les achats →
        </a>
      </div>
    );
  }

  const paymentMethods = [
    { id: "CARD", label: "Carte bancaire", Icon: CreditCard },
    { id: "BANK_TRANSFER", label: "Virement bancaire", Icon: Banknote },
    { id: "CASH_ON_DELIVERY", label: "Paiement à la livraison", Icon: Package },
    { id: "CRYPTO", label: "Crypto-monnaie", Icon: Bitcoin },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Finaliser la commande</h1>

      {state && !state.success && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <input type="hidden" name="addressId" value={selectedAddress} />
        <input type="hidden" name="paymentMethod" value={paymentMethod} />

        <div className="lg:col-span-2 space-y-8">
          {/* Delivery Address */}
          <div className="bg-luxury-card border border-luxury-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gold-400" /> Adresse de livraison
            </h2>

            {data.addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-luxury-muted text-sm mb-4">Aucune adresse enregistrée.</p>
                <a href="/dashboard/profile" className="text-gold-400 text-sm hover:text-gold-300 transition-colors flex items-center gap-1 justify-center">
                  <Plus className="h-4 w-4" /> Ajouter une adresse
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {data.addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAddress === addr.id
                        ? "border-gold-500 bg-gold-500/10"
                        : "border-luxury-border hover:border-luxury-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-0.5 accent-gold-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {addr.firstName} {addr.lastName}
                        {addr.label && <span className="ml-2 text-xs text-luxury-muted">({addr.label})</span>}
                        {addr.isDefault && <span className="ml-2 text-xs text-gold-400">Par défaut</span>}
                      </p>
                      <p className="text-xs text-luxury-muted mt-0.5">{addr.street}, {addr.city}, {addr.country}</p>
                    </div>
                  </label>
                ))}
                <a href="/dashboard/profile" className="text-xs text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1 mt-2">
                  <Plus className="h-3 w-3" /> Ajouter une nouvelle adresse
                </a>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-luxury-card border border-luxury-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gold-400" /> Mode de paiement
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(({ id, label, Icon }) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    paymentMethod === id
                      ? "border-gold-500 bg-gold-500/10"
                      : "border-luxury-border hover:border-luxury-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentSelect"
                    value={id}
                    checked={paymentMethod === id}
                    onChange={() => setPaymentMethod(id)}
                    className="accent-gold-500"
                  />
                  <Icon className="h-4 w-4 text-luxury-light" />
                  <span className="text-sm text-luxury-light">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-luxury-card border border-luxury-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-white mb-4">Récapitulatif</h2>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {data.cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-luxury-muted line-clamp-1">{item.productName} ×{item.quantity}</span>
                  <span className="text-luxury-light shrink-0 ml-2">{new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-luxury-border space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-luxury-muted">Livraison</span>
                <span className="text-green-400">Gratuite</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-gold-400 text-lg">
                  {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(data.subtotal)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
              disabled={!selectedAddress}
            >
              {isPending ? "Traitement..." : "Confirmer la commande"}
            </Button>

            <p className="mt-4 text-xs text-luxury-muted text-center">
              Paiement 100% sécurisé · Données chiffrées
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
