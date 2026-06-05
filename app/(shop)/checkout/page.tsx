"use client";

import { useActionState, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrderAction } from "@/actions/orders";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import { computePricing } from "@/lib/pricing";
import {
  MapPin, Phone, Plus, Building2, Store, Check, ChevronLeft, ChevronRight,
  ShoppingBag, ShieldCheck, Wallet, Tag, X, Loader2, MessageSquare,
} from "lucide-react";

interface Address {
  id: string; label: string; firstName: string; lastName: string;
  street: string; city: string; country: string; isDefault: boolean; phone: string;
}
interface CartItem { id: string; productName: string; quantity: number; unitPrice: number; total: number; imageUrl: string | null; }
interface Pricing { subtotal: number; discount?: number; shipping: number; total: number; deposit: number; remaining: number; freeShipping: boolean; }
interface CheckoutData { addresses: Address[]; cartItems: CartItem[]; pricing: Pricing; defaultPhone: string; }

const METHODS = [
  { id: "BANK_TRANSFER", label: "Virement bancaire",  desc: "Virement ou versement en agence bancaire", Icon: Building2 },
  { id: "CASHPLUS",      label: "CashPlus",            desc: "Dépôt en agence CashPlus",                Icon: Store },
  { id: "WAFACASH",      label: "Wafacash",            desc: "Dépôt en agence Wafacash",                Icon: Store },
] as const;

const STEPS = ["Livraison", "Récapitulatif", "Acompte"];

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(n);

export default function CheckoutPage() {
  const router = useRouter();
  const [data, setData]           = useState<CheckoutData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [step, setStep]           = useState(0);
  const [addressId, setAddressId] = useState("");
  const [phone, setPhone]         = useState("");
  const [method, setMethod]       = useState<string>("BANK_TRANSFER");
  const [notes, setNotes]         = useState("");
  const [promoInput, setPromoInput]   = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError]     = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; description: string | null } | null>(null);

  const applyPromo = useCallback(async () => {
    if (!promoInput.trim() || !data) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res  = await fetch(`/api/promo/validate?code=${encodeURIComponent(promoInput.trim())}&subtotal=${data.pricing.subtotal}`);
      const json = await res.json();
      if (json.valid) {
        setAppliedPromo({ code: json.code, discount: json.discountAmount, description: json.description });
        setPromoInput("");
      } else {
        setPromoError(json.error ?? "Code invalide");
      }
    } catch { setPromoError("Erreur de validation"); }
    setPromoLoading(false);
  }, [promoInput, data]);

  const removePromo = useCallback(() => { setAppliedPromo(null); setPromoError(""); }, []);

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
    async (_prev: unknown, fd: FormData) => createOrderAction(fd),
    null,
  );

  const phoneValid      = useMemo(() => /^(?:\+212|0)[\s.-]?\d(?:[\s.-]?\d){8}$/.test(phone.trim()), [phone]);
  const canContinueStep1 = Boolean(addressId) && phoneValid;
  const effectivePricing = useMemo(() => data ? computePricing(data.pricing.subtotal, appliedPromo?.discount ?? 0) : null, [data, appliedPromo]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
          <p className="text-sm text-luxury-muted">Chargement…</p>
        </div>
      </div>
    );
  }

  const pricing = effectivePricing ?? data?.pricing;

  if (!data || data.cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-luxury-border bg-luxury-dark">
          <ShoppingBag className="h-9 w-9 text-luxury-muted" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-luxury-white">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-luxury-muted">Ajoutez un article pour passer commande.</p>
        <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-gold-400">
          Explorer la collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-28 lg:pb-14">

      {/* ── Header ── */}
      <div className="mb-8">
        <Link href="/cart" className="mb-4 inline-flex items-center gap-1 text-sm text-luxury-muted transition-colors hover:text-gold-500">
          <ChevronLeft className="h-4 w-4" /> Retour au panier
        </Link>
        <h1 className="font-serif text-2xl font-bold text-luxury-white sm:text-3xl">
          Finaliser ma commande
        </h1>
      </div>

      {/* ── Step indicator ── */}
      <ol className="mb-8 flex items-center">
        {STEPS.map((label, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  done   ? "bg-gold-500 text-black" :
                  active ? "border-2 border-gold-500 bg-gold-500/10 text-gold-500" :
                           "border border-luxury-border text-luxury-muted"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`hidden text-sm font-medium transition-colors sm:block ${active ? "text-luxury-white" : "text-luxury-muted"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-3 h-px flex-1 transition-colors ${done ? "bg-gold-500/50" : "bg-luxury-border"}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Global error ── */}
      {state && !state.success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
          <X className="h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <input type="hidden" name="addressId"  value={addressId} />
        <input type="hidden" name="phone"      value={phone} />
        <input type="hidden" name="method"     value={method} />
        <input type="hidden" name="notes"      value={notes} />
        <input type="hidden" name="promoCode"  value={appliedPromo?.code ?? ""} />

        <div className="space-y-5">

          {/* ━━━━━  STEP 1 — Delivery  ━━━━━ */}
          {step === 0 && (
            <div className="space-y-5 animate-fade-in">

              {/* Address */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <MapPin className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Adresse de livraison</h2>
                </div>
                <div className="p-5">
                  {data.addresses.length === 0 ? (
                    <div className="flex flex-col items-center rounded-xl border border-dashed border-luxury-border py-10 text-center">
                      <MapPin className="mb-3 h-8 w-8 text-luxury-muted" />
                      <p className="text-sm text-luxury-muted">Aucune adresse enregistrée.</p>
                      <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold-500 transition-colors hover:text-gold-400">
                        <Plus className="h-3.5 w-3.5" /> Ajouter une adresse
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.addresses.map((addr) => (
                        <label key={addr.id} className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
                          addressId === addr.id ? "border-gold-500 bg-gold-500/5" : "border-luxury-border hover:border-gold-500/30"
                        }`}>
                          <input type="radio" className="hidden" name="addr" checked={addressId === addr.id}
                            onChange={() => { setAddressId(addr.id); if (!phone && addr.phone) setPhone(addr.phone); }} />
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            addressId === addr.id ? "border-gold-500 bg-gold-500" : "border-luxury-border"
                          }`}>
                            {addressId === addr.id && <div className="h-2 w-2 rounded-full bg-black" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-luxury-white">
                              {addr.firstName} {addr.lastName}
                              {addr.isDefault && (
                                <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-500">
                                  Par défaut
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-luxury-muted">{addr.street}</p>
                            <p className="text-xs text-luxury-muted">{addr.city}</p>
                          </div>
                        </label>
                      ))}
                      <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-500 transition-colors hover:text-gold-400">
                        <Plus className="h-3.5 w-3.5" /> Ajouter une nouvelle adresse
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <Phone className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Téléphone de contact</h2>
                </div>
                <div className="p-5">
                  <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 6XX XXX XXX" className="input-luxury w-full" />
                  {phone && !phoneValid
                    ? <p className="mt-2 text-xs text-red-400">Numéro de téléphone invalide.</p>
                    : <p className="mt-2 text-xs text-luxury-muted">Le livreur vous contactera à ce numéro.</p>
                  }
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━  STEP 2 — Review  ━━━━━ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">

              {/* Items */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <ShoppingBag className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Vos articles</h2>
                  <span className="ml-auto rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-500">
                    {data.cartItems.length}
                  </span>
                </div>
                <div className="divide-y divide-luxury-border">
                  {data.cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-luxury-white">{item.productName}</p>
                        <p className="text-[11px] text-luxury-muted">Qté : {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-luxury-white">{fmt(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <Tag className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Code promotionnel</h2>
                </div>
                <div className="p-5">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm font-semibold text-emerald-700">
                        {appliedPromo.code}
                        <span className="ml-1 font-normal text-emerald-600">· −{appliedPromo.discount} MAD</span>
                      </p>
                      <button type="button" onClick={removePromo} className="text-luxury-muted transition-colors hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
                        placeholder="CODEDISCOUNT" className="input-luxury flex-1 uppercase tracking-widest" />
                      <button type="button" onClick={applyPromo} disabled={!promoInput.trim() || promoLoading}
                        className="inline-flex items-center rounded-xl border border-luxury-border px-4 py-2 text-sm font-medium text-luxury-muted transition-colors hover:text-luxury-white disabled:opacity-40">
                        {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="mt-2 text-xs text-red-400">{promoError}</p>}
                </div>
              </div>

              {/* Notes */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <MessageSquare className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Note (facultatif)</h2>
                </div>
                <div className="p-5">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    placeholder="Instructions de livraison, remarques particulières…" className="input-luxury w-full resize-none" />
                </div>
              </div>

              {/* Mobile summary */}
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card lg:hidden">
                <div className="border-b border-luxury-border px-5 py-4">
                  <h2 className="text-sm font-semibold text-luxury-white">Récapitulatif</h2>
                </div>
                <div className="p-5">
                  {pricing && <PriceBreakdown {...pricing} promoCode={appliedPromo?.code} />}
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━  STEP 3 — Deposit Method  ━━━━━ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-luxury-border px-5 py-4">
                  <Wallet className="h-[15px] w-[15px] text-gold-500" />
                  <h2 className="text-sm font-semibold text-luxury-white">Mode de règlement de l&apos;acompte</h2>
                </div>
                <div className="divide-y divide-luxury-border">
                  {METHODS.map(({ id, label, desc, Icon }) => (
                    <label key={id} className={`flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors ${
                      method === id ? "bg-gold-500/5" : "hover:bg-luxury-dark/10"
                    }`}>
                      <input type="radio" className="hidden" name="meth" checked={method === id} onChange={() => setMethod(id)} />
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        method === id ? "border-gold-500 bg-gold-500" : "border-luxury-border"
                      }`}>
                        {method === id && <div className="h-2 w-2 rounded-full bg-black" />}
                      </div>
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        method === id ? "bg-gold-500/15" : "bg-luxury-dark"
                      }`}>
                        <Icon className={`h-4 w-4 transition-colors ${method === id ? "text-gold-500" : "text-luxury-muted"}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold transition-colors ${method === id ? "text-luxury-white" : "text-luxury-muted"}`}>
                          {label}
                        </p>
                        <p className="text-[11px] text-luxury-muted">{desc}</p>
                      </div>
                      {method === id && <Check className="h-4 w-4 shrink-0 text-gold-500" />}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-luxury-border bg-luxury-dark/50 px-4 py-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                <p className="text-xs leading-relaxed text-luxury-muted">
                  Votre commande est confirmée uniquement après validation de l&apos;acompte par notre équipe.
                  Aucun paiement complet en ligne n&apos;est exigé.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-4 py-2.5 text-sm font-medium text-luxury-muted transition-colors hover:border-luxury-muted hover:text-luxury-white">
                <ChevronLeft className="h-4 w-4" /> Retour
              </button>
            ) : (
              <Link href="/cart"
                className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-4 py-2.5 text-sm font-medium text-luxury-muted transition-colors hover:border-luxury-muted hover:text-luxury-white">
                <ChevronLeft className="h-4 w-4" /> Panier
              </Link>
            )}

            {step < 2 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !canContinueStep1}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40">
                Continuer <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={isPending || !addressId || !phoneValid}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40">
                {isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Création en cours…</>
                  : <><Check className="h-4 w-4" /> Confirmer &amp; payer l&apos;acompte</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
            <div className="border-b border-luxury-border px-5 py-4">
              <h2 className="text-sm font-semibold text-luxury-white">Récapitulatif</h2>
            </div>
            <div className="p-5">
              {pricing && <PriceBreakdown {...pricing} promoCode={appliedPromo?.code} />}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
