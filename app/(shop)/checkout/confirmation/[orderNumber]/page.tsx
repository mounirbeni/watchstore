import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { getDepositMethods } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import DepositProofForm, { type ProofMethod } from "@/components/checkout/DepositProofForm";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { CheckCircle2, Clock, PartyPopper } from "lucide-react";

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
  const pending = order.status === "DEPOSIT_PENDING";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 pb-24">
      {/* Header state */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 border border-gold-500/40">
          {awaiting ? <CheckCircle2 className="h-8 w-8 text-gold-400" /> : pending ? <Clock className="h-8 w-8 text-gold-400" /> : <PartyPopper className="h-8 w-8 text-gold-400" />}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          {awaiting ? "Commande enregistrée" : pending ? "Preuve en vérification" : "Commande confirmée"}
        </h1>
        <p className="mt-2 text-luxury-muted">
          Commande <span className="font-medium text-gold-400">{order.orderNumber}</span>
        </p>
        <div className="mt-3 flex justify-center"><StatusBadge status={order.status} /></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Summary */}
        <div className="rounded-2xl border border-luxury-border bg-luxury-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Récapitulatif</h2>
          <div className="mb-4 space-y-2">
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-luxury-light">{i.productName} <span className="text-luxury-muted">×{i.quantity}</span></span>
                <span className="text-luxury-light">{formatPrice(Number(i.total))}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-luxury-border pt-4">
            <PriceBreakdown {...pricing} hideNote />
          </div>
        </div>

        {/* Action */}
        <div className="rounded-2xl border border-luxury-border bg-luxury-card p-6">
          {awaiting ? (
            <>
              <h2 className="mb-1 text-lg font-semibold text-white">Réglez votre acompte</h2>
              <p className="mb-5 text-sm text-luxury-muted">
                Réglez {formatPrice(pricing.deposit)} pour confirmer votre commande, puis envoyez la preuve.
              </p>
              <DepositProofForm orderId={order.id} methods={methods} defaultMethod={defaultMethod} />
            </>
          ) : pending ? (
            <div className="text-center">
              <Clock className="mx-auto mb-3 h-10 w-10 text-gold-400" />
              <h2 className="font-serif text-lg text-white">Vérification en cours</h2>
              <p className="mt-2 text-sm text-luxury-muted">
                Nous vérifions votre acompte. Vous serez notifié dès la confirmation. Suivez l&apos;état dans votre
                espace client.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <PartyPopper className="mx-auto mb-3 h-10 w-10 text-gold-400" />
              <h2 className="font-serif text-lg text-white">Merci !</h2>
              <p className="mt-2 text-sm text-luxury-muted">
                Votre commande est confirmée. Le solde de {formatPrice(pricing.remaining)} sera réglé à la livraison.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <Link href={`/dashboard/orders/${order.orderNumber}`} className="text-center text-sm text-gold-400 hover:text-gold-300">
              Suivre ma commande
            </Link>
            <Link href="/shop" className="text-center text-sm text-luxury-muted hover:text-luxury-light">
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
