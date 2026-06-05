import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { getDepositMethods } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import DepositProofForm, { type ProofMethod } from "@/components/checkout/DepositProofForm";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  CheckCircle2, Clock, PartyPopper, ShoppingBag, ArrowRight,
  Wallet, Package,
} from "lucide-react";

export const metadata = { title: "Confirmation de commande" };

interface Props { params: Promise<{ orderNumber: string }> }

export default async function ConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect(`/login?from=/checkout/confirmation/${orderNumber}`);
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payment: true, items: true },
  });
  if (!order || order.userId !== session.userId) notFound();

  const pricing = {
    subtotal: Number(order.subtotal),
    shipping: Number(order.shippingCost),
    total: Number(order.total),
    deposit: Number(order.depositAmount),
    remaining: Number(order.remainingBalance),
    freeShipping: Number(order.shippingCost) === 0,
  };

  const methods = getDepositMethods(formatPrice(pricing.deposit)) as ProofMethod[];
  const defaultMethod = (["BANK_TRANSFER", "CASHPLUS", "WAFACASH"].includes(order.payment?.method ?? "")
    ? order.payment!.method
    : "BANK_TRANSFER") as ProofMethod["id"];

  const awaiting = order.status === "AWAITING_DEPOSIT";
  const pending  = order.status === "DEPOSIT_PENDING";
  const confirmed = !awaiting && !pending;

  const headerIcon = awaiting
    ? <CheckCircle2 className="h-8 w-8 text-gold-500" />
    : pending
    ? <Clock className="h-8 w-8 text-gold-500" />
    : <PartyPopper className="h-8 w-8 text-gold-500" />;

  const headerTitle = awaiting
    ? "Commande enregistrée !"
    : pending
    ? "Preuve en cours de vérification"
    : "Commande confirmée !";

  const headerSub = awaiting
    ? "Réglez votre acompte pour finaliser la commande."
    : pending
    ? "Nous vérifions votre reçu. Vous serez notifié dès la confirmation."
    : `Le solde de ${formatPrice(pricing.remaining)} sera réglé à la livraison.`;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 pb-24 animate-fade-in">

      {/* ── Hero header ── */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10">
          {headerIcon}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-white">
          {headerTitle}
        </h1>
        <p className="mt-2 text-sm text-luxury-muted max-w-sm mx-auto">{headerSub}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm text-luxury-muted">Commande</span>
          <span className="font-mono text-sm font-semibold text-gold-500">{order.orderNumber}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* ── Deposit action (awaiting) ── */}
      {awaiting && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
          <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
            <Wallet className="h-[15px] w-[15px] text-gold-500" />
            <h2 className="font-serif text-base font-semibold text-luxury-white">Réglez votre acompte</h2>
          </div>
          <div className="p-5">
            <p className="mb-5 text-sm text-luxury-muted">
              Réglez <span className="font-semibold text-luxury-white">{formatPrice(pricing.deposit)}</span> pour
              confirmer votre commande, puis envoyez la photo du reçu.
            </p>
            <DepositProofForm orderId={order.id} methods={methods} defaultMethod={defaultMethod} />
          </div>
        </div>
      )}

      {/* ── Pending verification ── */}
      {pending && (
        <div className="mb-5 flex items-start gap-4 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
            <Clock className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <p className="font-semibold text-luxury-white">Vérification en cours</p>
            <p className="mt-1 text-sm text-luxury-muted">
              Votre reçu a bien été reçu. Notre équipe le vérifie généralement sous quelques heures.
              Suivez l&apos;état en temps réel dans votre espace client.
            </p>
          </div>
        </div>
      )}

      {/* ── Confirmed ── */}
      {confirmed && (
        <div className="mb-5 flex items-start gap-4 rounded-2xl border border-green-500/30 bg-green-500/5 p-5 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-luxury-white">Commande en cours de traitement</p>
            <p className="mt-1 text-sm text-luxury-muted">
              Votre acompte a été validé. Nous préparons votre commande. Le solde
              de <span className="font-semibold text-luxury-white">{formatPrice(pricing.remaining)}</span> sera
              réglé à la livraison.
            </p>
          </div>
        </div>
      )}

      {/* ── Order summary ── */}
      <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <Package className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="font-serif text-base font-semibold text-luxury-white">
            Récapitulatif{" "}
            <span className="font-sans text-sm text-luxury-muted font-normal">({order.items.length} article{order.items.length > 1 ? "s" : ""})</span>
          </h2>
        </div>

        {/* Items */}
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

        {/* Pricing */}
        <div className="border-t border-luxury-border p-5">
          <PriceBreakdown {...pricing} hideNote />
        </div>
      </div>

      {/* ── Next steps / CTAs ── */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <ShoppingBag className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="font-serif text-base font-semibold text-luxury-white">Et maintenant ?</h2>
        </div>
        <div className="p-5 space-y-3">
          <Link
            href={`/dashboard/orders/${order.orderNumber}`}
            className="flex items-center justify-between rounded-xl border border-luxury-border px-4 py-3.5 transition-colors hover:border-gold-500/50 hover:bg-gold-500/5 group"
          >
            <div>
              <p className="text-sm font-semibold text-luxury-white">Suivre ma commande</p>
              <p className="text-xs text-luxury-muted mt-0.5">Voir le statut et l&apos;historique en temps réel</p>
            </div>
            <ArrowRight className="h-4 w-4 text-luxury-muted group-hover:text-gold-500 transition-colors" />
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-between rounded-xl border border-luxury-border px-4 py-3.5 transition-colors hover:border-gold-500/50 hover:bg-gold-500/5 group"
          >
            <div>
              <p className="text-sm font-semibold text-luxury-white">Continuer mes achats</p>
              <p className="text-xs text-luxury-muted mt-0.5">Découvrir d&apos;autres pièces de la collection</p>
            </div>
            <ArrowRight className="h-4 w-4 text-luxury-muted group-hover:text-gold-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
