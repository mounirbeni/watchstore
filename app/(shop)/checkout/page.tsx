"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrderAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import {
  MapPin, Phone, Plus, Building2, Store, Check, ChevronLeft, ChevronRight,
  ShoppingBag, ShieldCheck, Wallet,
} from "lucide-react";

interface Address {
  id: string; label: string; firstName: string; lastName: string;
  street: string; city: string; country: string; isDefault: boolean; phone: string;
}
interface CartItem { id: string; productName: string; quantity: number; unitPrice: number; total: number; imageUrl: string | null; }
interface Pricing { subtotal: number; shipping: number; total: number; deposit: number; remaining: number; freeShipping: boolean; }
interface CheckoutData { addresses: Address[]; cartItems: CartItem[]; pricing: Pricing; defaultPhone: string; }

const METHODS = [
  { id: "BANK_TRANSFER", label: "Virement bancaire", desc: "RIB · virement ou versement", Icon: Building2 },
  { id: "CASHPLUS", label: "CashPlus", desc: "Dépôt en agence", Icon: Store },
  { id: "WAFACASH", label: "Wafacash", desc: "Dépôt en agence", Icon: Store },
] as const;

const STEPS = ["Livraison", "Récapitulatif", "Acompte"];

export default function CheckoutPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  const [addressId, setAddressId] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<string>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/checkout-data")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: CheckoutData) => {
        setData(d);
        const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
        if (def) setAddressId(def.id);
        setPhone(d.defaultPhone || def?.phone || "");
        setLoading(false);
      })
      .catch(() => router.push("/cart"));
  }, [router]);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => createOrderAction(formData),
    null,
  );

  const phoneValid = useMemo(() => /^(?:\+212|0)[\s.-]?\d(?:[\s.-]?\d){8}$/.test(phone.trim()), [phone]);
  const canContinueStep1 = Boolean(addressId) && phoneValid;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    );
  }

  if (!data || data.cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-card border border-luxury-border text-luxury-muted">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="font-serif text-2xl text-white">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-luxury-muted">Ajoutez un article pour passer commande.</p>
        <Link href="/shop" className="mt-6 inline-block"><Button size="lg">Explorer la collection</Button></Link>
      </div>
    );
  }

  const { pricing } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-28 lg:pb-12">
      <h1 className="mb-6 font-serif text-2xl sm:text-3xl font-bold text-white">Finaliser ma commande</h1>

      {/* Progress indicator */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done ? "bg-gold-500 text-black" : active ? "border-2 border-gold-500 text-gold-400" : "border border-luxury-border text-luxury-muted"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`hidden sm:block text-sm ${active ? "text-white font-medium" : "text-luxury-muted"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? "bg-gold-500" : "bg-luxury-border"}`} />}
            </li>
          );
        })}
      </ol>

      {state && !state.success && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <input type="hidden" name="addressId" value={addressId} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="method" value={method} />
        <input type="hidden" name="notes" value={notes} />

        <div className="space-y-6 lg:col-span-2">
          {/* STEP 1 — Delivery */}
          {step === 0 && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-luxury-border bg-luxury-card p-5 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <MapPin className="h-5 w-5 text-gold-400" /> Adresse de livraison
                </h2>
                {data.addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-luxury-border p-6 text-center">
                    <p className="mb-3 text-sm text-luxury-muted">Aucune adresse enregistrée.</p>
                    <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300">
                      <Plus className="h-4 w-4" /> Ajouter une adresse
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                          addressId === addr.id ? "border-gold-500 bg-gold-500/10" : "border-luxury-border hover:border-luxury-muted"
                        }`}
                      >
                        <input type="radio" name="addressSelect" checked={addressId === addr.id}
                          onChange={() => { setAddressId(addr.id); if (!phone && addr.phone) setPhone(addr.phone); }}
                          className="mt-0.5 accent-gold-500" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {addr.firstName} {addr.lastName}
                            {addr.isDefault && <span className="ml-2 text-xs text-gold-400">Par défaut</span>}
                          </p>
                          <p className="mt-0.5 text-xs text-luxury-muted">{addr.street}, {addr.city}, {addr.country}</p>
                        </div>
                      </label>
                    ))}
                    <Link href="/dashboard/profile" className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">
                      <Plus className="h-3 w-3" /> Ajouter une nouvelle adresse
                    </Link>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-luxury-border bg-luxury-card p-5 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <Phone className="h-5 w-5 text-gold-400" /> Téléphone de contact
                </h2>
                <input
                  type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78" className="input-luxury w-full"
                />
                <p className="mt-2 text-xs text-luxury-muted">
                  Le livreur vous contactera à ce numéro pour la livraison.
                </p>
                {phone && !phoneValid && <p className="mt-1 text-xs text-red-400">Numéro de téléphone invalide.</p>}
              </section>
            </div>
          )}

          {/* STEP 2 — Review */}
          {step === 1 && (
            <section className="rounded-2xl border border-luxury-border bg-luxury-card p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Vos articles</h2>
              <div className="space-y-3">
                {data.cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 border-b border-luxury-border pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-luxury-light">{item.productName} <span className="text-luxury-muted">×{item.quantity}</span></span>
                    <span className="shrink-0 text-sm font-medium text-white">
                      {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(item.total)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-luxury-border pt-6 lg:hidden">
                <PriceBreakdown {...pricing} />
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted">Note (facultatif)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Instructions de livraison…" className="input-luxury w-full resize-none" />
              </div>
            </section>
          )}

          {/* STEP 3 — Deposit method */}
          {step === 2 && (
            <section className="rounded-2xl border border-luxury-border bg-luxury-card p-5 sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-white">
                <Wallet className="h-5 w-5 text-gold-400" /> Paiement de l&apos;acompte
              </h2>
              <p className="mb-4 text-sm text-luxury-muted">
                Choisissez comment régler l&apos;acompte. Les instructions détaillées s&apos;afficheront après la
                création de la commande.
              </p>
              <div className="space-y-3">
                {METHODS.map(({ id, label, desc, Icon }) => (
                  <label key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                      method === id ? "border-gold-500 bg-gold-500/10" : "border-luxury-border hover:border-luxury-muted"
                    }`}>
                    <input type="radio" name="methodSelect" checked={method === id} onChange={() => setMethod(id)} className="accent-gold-500" />
                    <Icon className="h-5 w-5 text-gold-400" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-white">{label}</span>
                      <span className="block text-xs text-luxury-muted">{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-luxury-border bg-luxury-dark/50 p-4 text-xs text-luxury-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <p>Votre commande est confirmée uniquement après validation de l&apos;acompte par notre équipe. Aucun paiement complet en ligne n&apos;est demandé.</p>
              </div>
            </section>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Retour
              </Button>
            ) : (
              <Link href="/cart"><Button type="button" variant="ghost"><ChevronLeft className="mr-1 h-4 w-4" /> Panier</Button></Link>
            )}

            {step < 2 ? (
              <Button type="button" size="lg" disabled={step === 0 && !canContinueStep1} onClick={() => setStep((s) => s + 1)}>
                Continuer <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="lg" loading={isPending} disabled={!addressId || !phoneValid}>
                {isPending ? "Création…" : "Confirmer et payer l'acompte"}
              </Button>
            )}
          </div>
        </div>

        {/* Sticky summary (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-luxury-border bg-luxury-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Récapitulatif</h2>
            <PriceBreakdown {...pricing} />
          </div>
        </aside>
      </form>
    </div>
  );
}
