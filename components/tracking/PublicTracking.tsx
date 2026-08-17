"use client";

import { useActionState } from "react";
import Link from "next/link";
import { lookupOrderAction } from "@/actions/tracking";
import { formatPrice } from "@/lib/utils";
import {
  TIMELINE_STAGES, rankFor, formatTimestamp, stageTimestamps,
} from "@/lib/order-timeline";
import {
  Search, Check, XCircle, Truck, Package, Wallet, ShoppingBag,
  PackageCheck, Phone, MapPin, Hash, ArrowRight, ShieldQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STAGE_ICON: Record<string, LucideIcon> = {
  created: ShoppingBag,
  confirmed: Wallet,
  preparing: Package,
  shipped: Truck,
  delivery: Truck,
  delivered: PackageCheck,
};

export default function PublicTracking() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => lookupOrderAction(formData),
    null,
  );

  const order = state?.success ? state.data : null;
  const cancelled = order?.status === "CANCELLED" || order?.status === "REFUNDED";
  const rank = order ? rankFor(order.status) : -1;
  const timestamps = order ? stageTimestamps(order) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10">
          <Search className="h-7 w-7 text-gold-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-luxury-white sm:text-3xl">
          Suivre ma commande
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-luxury-muted">
          Pas besoin de compte. Saisissez votre numéro de commande ou de suivi,
          ainsi que le téléphone indiqué lors de la commande.
        </p>
      </header>

      {/* ── Lookup form ── */}
      <form
        action={formAction}
        className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card"
      >
        <div className="space-y-4 p-5">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-muted">
              Numéro de commande ou de suivi
            </span>
            <input
              name="reference"
              required
              autoComplete="off"
              placeholder="ORD-2026-00000"
              className="input-luxury w-full"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-luxury-muted">
              Téléphone de la commande
            </span>
            <input
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="06 00 00 00 00"
              className="input-luxury w-full"
            />
          </label>

          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-luxury-muted">
            <ShieldQuestion className="mt-px h-3.5 w-3.5 shrink-0 text-gold-500" />
            Le téléphone nous sert à vérifier que la commande est bien la vôtre.
            Aucune adresse ni coordonnée bancaire n&apos;est affichée sur cette page.
          </p>
        </div>

        <div className="border-t border-luxury-border p-5 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold-500 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:opacity-60"
          >
            {isPending ? "Recherche…" : "Suivre ma commande"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>

      {state && !state.success && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {state.error}
        </p>
      )}

      {/* ── Result ── */}
      {order && (
        <div className="mt-6 space-y-5 animate-fade-in">
          {/* Summary */}
          <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-luxury-border px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
                  Commande
                </p>
                <p className="font-serif text-lg font-semibold text-luxury-white">
                  {order.orderNumber}
                </p>
              </div>
              {order.city && (
                <span className="flex items-center gap-1.5 text-sm text-luxury-muted">
                  <MapPin className="h-3.5 w-3.5 text-gold-500" />
                  {order.city}
                </span>
              )}
            </div>

            <div className="divide-y divide-luxury-border">
              {order.items.map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3">
                  <p className="truncate text-sm text-luxury-white">{item.name}</p>
                  <span className="shrink-0 text-xs text-luxury-muted">× {item.quantity}</span>
                </div>
              ))}
            </div>

            {!cancelled && (
              <div className="flex items-center justify-between gap-3 border-t border-luxury-border bg-gold-500/5 px-5 py-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-luxury-muted">
                  À régler à la livraison
                </span>
                <span className="font-semibold text-gold-600">{formatPrice(order.amountDue)}</span>
              </div>
            )}
          </div>

          {/* Cancelled */}
          {cancelled ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <p className="font-medium text-luxury-white">
                Commande {order.status === "REFUNDED" ? "remboursée" : "annulée"}
              </p>
            </div>
          ) : (
            /* Timeline */
            <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
              <div className="border-b border-luxury-border px-5 py-4">
                <h2 className="font-serif text-base font-semibold text-luxury-white">
                  Suivi de commande
                </h2>
              </div>
              <div className="p-5">
                <ol>
                  {TIMELINE_STAGES.map((stage, i) => {
                    const isLast = i === TIMELINE_STAGES.length - 1;
                    const reached = rank >= i;
                    const isCurrent = rank === i;
                    const ts = timestamps[i];
                    const Icon = STAGE_ICON[stage.key] ?? Package;

                    return (
                      <li key={stage.key} className={`relative flex gap-4 ${isLast ? "" : "pb-7"}`}>
                        {!isLast && (
                          <div
                            className={`absolute left-[15px] top-8 bottom-0 w-px ${
                              rank > i ? "bg-gold-500/50" : "bg-luxury-border"
                            }`}
                          />
                        )}

                        <div className="relative z-10 shrink-0">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              reached && !isCurrent
                                ? "bg-gold-500 text-black"
                                : isCurrent
                                  ? "border-2 border-gold-500 bg-gold-500/15 text-gold-500"
                                  : "border border-luxury-border bg-white text-luxury-muted"
                            }`}
                          >
                            {reached && !isCurrent
                              ? <Check className="h-3.5 w-3.5" />
                              : <Icon className="h-3.5 w-3.5" />}
                          </div>
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full bg-gold-500/25 animate-ping" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <p className={`text-sm font-semibold ${reached ? "text-luxury-white" : "text-luxury-muted"}`}>
                              {stage.label}
                            </p>
                            {ts && (
                              <time
                                dateTime={new Date(ts).toISOString()}
                                className="text-[11px] tabular-nums text-gold-600/80"
                              >
                                {formatTimestamp(new Date(ts))}
                              </time>
                            )}
                          </div>
                          <p className={`mt-0.5 text-[11px] ${reached ? "text-luxury-muted" : "text-luxury-muted/60"}`}>
                            {stage.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {/* Tracking number */}
          {order.trackingNumber && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-luxury-border bg-white px-5 py-4 shadow-card">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-luxury-muted">
                <Hash className="h-3.5 w-3.5 text-gold-500" />
                Numéro de suivi
              </span>
              <span className="font-mono text-sm font-semibold text-luxury-white">
                {order.trackingNumber}
              </span>
            </div>
          )}

          {/* Courier, once the parcel is moving */}
          {rank >= rankFor("OUT_FOR_DELIVERY") && !cancelled &&
            (order.courierName || order.carrierName || order.courierPhone) && (
            <div className="overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-gold-500/20 bg-gradient-to-r from-gold-500/10 to-transparent px-5 py-4">
                <Truck className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="font-serif text-base font-semibold text-luxury-white">Votre livreur</h2>
              </div>
              <div className="p-5">
                {order.courierName && (
                  <p className="text-base font-semibold text-luxury-white">{order.courierName}</p>
                )}
                {order.carrierName && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
                    {order.carrierName}
                  </p>
                )}
                {order.courierPhone && (
                  <a
                    href={`tel:${order.courierPhone.replace(/[^\d+]/g, "")}`}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold-500 text-sm font-semibold text-black transition-colors hover:bg-gold-400"
                  >
                    <Phone className="h-4 w-4" />
                    Appeler le livreur
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-luxury-muted">
            Une question&nbsp;?{" "}
            <Link href="/garantie-retours" className="text-gold-500 hover:underline">
              Garantie &amp; retours
            </Link>{" "}
            ·{" "}
            <Link href="/faq" className="text-gold-500 hover:underline">
              FAQ
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
