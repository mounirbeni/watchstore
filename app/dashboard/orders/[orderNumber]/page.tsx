import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { cancelOrderAction } from "@/actions/orders";
import { getDepositMethods } from "@/lib/pricing";
import { formatPrice, formatDate } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import DepositProofForm, { type ProofMethod } from "@/components/checkout/DepositProofForm";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";
import TrackingRefresher from "@/components/dashboard/orders/TrackingRefresher";
import TrackingNumber from "@/components/dashboard/orders/TrackingNumber";
import {
  Check, Clock, XCircle, Truck, Package, Wallet,
  MapPin, ShoppingBag, ChevronLeft, PackageCheck,
} from "lucide-react";

interface Props { params: Promise<{ orderNumber: string }> }

interface Step {
  key: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  ts: Date | null;
}

function rankFor(status: string): number {
  switch (status) {
    case "DRAFT":
    case "PENDING":
    case "AWAITING_DEPOSIT":
    case "DEPOSIT_PENDING":  return 0;
    case "DEPOSIT_PAID":
    case "CONFIRMED":
    case "PROCESSING":       return 1;
    case "PREPARING":        return 2;
    case "SHIPPED":          return 3;
    case "OUT_FOR_DELIVERY": return 4;
    case "DELIVERED":        return 5;
    default:                 return -1;
  }
}

function fmtTs(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export const metadata = { title: "Suivi de commande" };

async function cancel(formData: FormData) {
  "use server";
  await cancelOrderAction(formData);
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const session = await requireAuth();

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payment: true, items: true, address: true },
  });
  if (!order || order.userId !== session.userId) notFound();

  const pricing = {
    subtotal:    Number(order.subtotal),
    shipping:    Number(order.shippingCost),
    total:       Number(order.total),
    deposit:     Number(order.depositAmount),
    remaining:   Number(order.remainingBalance),
    freeShipping: Number(order.shippingCost) === 0,
  };

  const methods = getDepositMethods(formatPrice(pricing.deposit)) as ProofMethod[];
  const defaultMethod = (
    ["BANK_TRANSFER", "CASHPLUS", "WAFACASH"].includes(order.payment?.method ?? "")
      ? order.payment!.method
      : "BANK_TRANSFER"
  ) as ProofMethod["id"];

  const cancelled   = order.status === "CANCELLED" || order.status === "REFUNDED";
  const rank        = rankFor(order.status);
  const needsDeposit  = order.status === "AWAITING_DEPOSIT";
  const depositPending = order.status === "DEPOSIT_PENDING";
  const depositFailed  = order.payment?.status === "DEPOSIT_FAILED";
  const cancellable    = ["AWAITING_DEPOSIT", "DEPOSIT_PENDING"].includes(order.status);
  const inTransit      = ["PREPARING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status);

  const steps: Step[] = [
    { key: "created",   label: "Commande créée",        desc: "Votre commande a bien été reçue",             Icon: ShoppingBag,  ts: order.createdAt },
    { key: "confirmed", label: "Confirmée",              desc: "Acompte validé — commande en traitement",     Icon: Wallet,       ts: order.confirmedAt },
    { key: "preparing", label: "En préparation",         desc: "Votre montre est en cours de préparation",    Icon: Package,      ts: order.preparingAt },
    { key: "shipped",   label: "Expédiée",               desc: "Colis pris en charge par le transporteur",   Icon: Truck,        ts: order.shippedAt },
    { key: "delivery",  label: "En cours de livraison",  desc: "Votre colis est en route vers vous",          Icon: Truck,        ts: order.outForDeliveryAt },
    { key: "delivered", label: "Livrée",                 desc: "Commande livrée avec succès",                 Icon: PackageCheck, ts: order.deliveredAt },
  ];

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div>
        <Link
          href="/dashboard/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-luxury-muted transition-colors hover:text-gold-500"
        >
          <ChevronLeft className="h-4 w-4" /> Mes commandes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-semibold text-luxury-white sm:text-2xl">
              Commande {order.orderNumber}
            </h1>
            <p className="mt-0.5 text-sm text-luxury-muted">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* ── Cancelled notice ── */}
      {cancelled && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-luxury-white">
              Commande {order.status === "REFUNDED" ? "remboursée" : "annulée"}
            </p>
            {order.cancellationReason && (
              <p className="mt-1 text-sm text-luxury-muted">{order.cancellationReason}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">

        {/* ━━━━━━━━  LEFT COLUMN  ━━━━━━━━ */}
        <div className="space-y-5">

          {/* Deposit card */}
          {(needsDeposit || depositPending) && (
            <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
                <Wallet className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="font-serif text-base font-semibold text-luxury-white">Acompte requis</h2>
              </div>
              <div className="p-5">
                {depositFailed && needsDeposit && (
                  <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-500">
                    Votre acompte n&apos;a pas pu être validé.
                    {order.adminNotes ? ` Motif : ${order.adminNotes}.` : ""}
                    {" "}Merci de renvoyer une preuve.
                  </p>
                )}
                {needsDeposit ? (
                  <>
                    <p className="mb-4 text-sm text-luxury-muted">
                      Réglez {formatPrice(pricing.deposit)} pour confirmer votre commande,
                      puis envoyez la preuve de paiement.
                    </p>
                    <DepositProofForm orderId={order.id} methods={methods} defaultMethod={defaultMethod} />
                  </>
                ) : (
                  <div className="flex items-start gap-3 rounded-xl border border-luxury-border bg-luxury-dark/40 p-4">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    <div>
                      <p className="text-sm font-medium text-luxury-white">Preuve en cours de vérification</p>
                      <p className="mt-1 text-xs text-luxury-muted">
                        Référence : {order.payment?.proofReference ?? "—"}.
                        Vous serez notifié dès la confirmation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tracking timeline ── */}
          {!cancelled && (
            <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-luxury-border px-5 py-4">
                <h2 className="font-serif text-base font-semibold text-luxury-white">Suivi de commande</h2>
                {inTransit && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En cours
                  </span>
                )}
                {order.status === "DELIVERED" && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gold-500">
                    <Check className="h-3 w-3" /> Livrée
                  </span>
                )}
              </div>

              <div className="p-5">
                <ol>
                  {steps.map((step, i) => {
                    const isLast   = i === steps.length - 1;
                    const reached  = rank >= i;
                    const isCurrent = rank === i;
                    const Icon     = step.Icon;

                    return (
                      <li key={step.key} className={`relative flex gap-4 ${isLast ? "" : "pb-7"}`}>
                        {/* Rail line */}
                        {!isLast && (
                          <div
                            className={`absolute left-[15px] top-8 bottom-0 w-px ${
                              rank > i ? "bg-gold-500/50" : "bg-luxury-border"
                            }`}
                          />
                        )}

                        {/* Step dot */}
                        <div className="relative z-10 shrink-0">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                              reached && !isCurrent
                                ? "bg-gold-500 text-black"
                                : isCurrent
                                ? "border-2 border-gold-500 bg-gold-500/15 text-gold-500"
                                : "border border-luxury-border bg-white text-luxury-muted"
                            }`}
                          >
                            {reached && !isCurrent
                              ? <Check className="h-3.5 w-3.5" />
                              : <Icon className="h-3.5 w-3.5" />
                            }
                          </div>
                          {isCurrent && (
                            <span className="absolute inset-0 rounded-full bg-gold-500/25 animate-ping" />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm font-semibold ${reached ? "text-luxury-white" : "text-luxury-muted"}`}>
                            {step.label}
                          </p>
                          {step.ts ? (
                            <p className="mt-0.5 text-[11px] text-luxury-muted">{fmtTs(step.ts)}</p>
                          ) : isCurrent ? (
                            <p className="mt-0.5 text-[11px] text-luxury-muted">{step.desc}</p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* Live refresh bar */}
                {inTransit && (
                  <div className="mt-6 border-t border-luxury-border pt-4">
                    <TrackingRefresher active />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Order items ── */}
          <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
            <div className="border-b border-luxury-border px-5 py-4">
              <h2 className="font-serif text-base font-semibold text-luxury-white">
                Articles{" "}
                <span className="text-sm font-sans text-luxury-muted">({order.items.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-luxury-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-luxury-white">{item.productName}</p>
                    <p className="text-[11px] text-luxury-muted">Qté : {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-luxury-white">
                    {formatPrice(Number(item.total))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ━━━━━━━━  RIGHT COLUMN  ━━━━━━━━ */}
        <div className="space-y-5">

          {/* Tracking number */}
          {order.trackingNumber && (
            <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 shadow-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gold-500/20 px-5 py-4">
                <Truck className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="font-serif text-base font-semibold text-luxury-white">Numéro de suivi</h2>
              </div>
              <div className="p-5">
                <TrackingNumber value={order.trackingNumber} />
              </div>
            </div>
          )}

          {/* Payment summary */}
          <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-luxury-border px-5 py-4">
              <h2 className="font-serif text-base font-semibold text-luxury-white">Paiement</h2>
              {order.payment && <StatusBadge status={order.payment.status} />}
            </div>
            <div className="p-5">
              <PriceBreakdown {...pricing} hideNote />
            </div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
                <MapPin className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="font-serif text-base font-semibold text-luxury-white">Adresse de livraison</h2>
              </div>
              <div className="space-y-0.5 p-5">
                <p className="text-sm font-medium text-luxury-white">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p className="text-sm text-luxury-muted">{order.address.street}</p>
                <p className="text-sm text-luxury-muted">
                  {order.address.city}{order.address.postalCode ? `, ${order.address.postalCode}` : ""}
                </p>
                <p className="text-sm text-luxury-muted">
                  {order.customerPhone ?? order.address.phone}
                </p>
              </div>
            </div>
          )}

          {/* Cancel */}
          {cancellable && (
            <div className="rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
              <div className="border-b border-luxury-border px-5 py-4">
                <h2 className="font-serif text-base font-semibold text-luxury-white">Annulation</h2>
              </div>
              <div className="p-5">
                <form action={cancel} className="space-y-3">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input
                    name="reason"
                    placeholder="Motif d'annulation (facultatif)"
                    className="input-luxury w-full"
                  />
                  <SubmitButton variant="ghost">Annuler ma commande</SubmitButton>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
