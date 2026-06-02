import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { cancelOrderAction } from "@/actions/orders";
import { getDepositMethods } from "@/lib/pricing";
import { formatPrice, formatDate } from "@/lib/utils";
import PriceBreakdown from "@/components/checkout/PriceBreakdown";
import DepositProofForm, { type ProofMethod } from "@/components/checkout/DepositProofForm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import { Check, Clock, XCircle, Truck, Package, Wallet } from "lucide-react";

interface Props { params: Promise<{ orderNumber: string }> }

const TIMELINE = [
  { key: "created", label: "Commande créée", Icon: Check },
  { key: "confirmed", label: "Acompte validé · confirmée", Icon: Wallet },
  { key: "preparing", label: "En préparation", Icon: Package },
  { key: "delivery", label: "En livraison", Icon: Truck },
  { key: "delivered", label: "Livrée", Icon: Check },
];

function rankFor(status: string): number {
  switch (status) {
    case "AWAITING_DEPOSIT":
    case "DEPOSIT_PENDING": return 0;
    case "DEPOSIT_PAID":
    case "CONFIRMED": return 1;
    case "PREPARING": return 2;
    case "OUT_FOR_DELIVERY": return 3;
    case "DELIVERED": return 4;
    default: return -1;
  }
}

export const metadata = { title: "Détail de commande" };

export default async function OrderDetailPage({ params }: Props) {
  const { orderNumber } = await params;
  const session = await requireAuth();

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payment: true, items: true, address: true },
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

  const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
  const rank = rankFor(order.status);
  const needsDeposit = order.status === "AWAITING_DEPOSIT";
  const depositPending = order.status === "DEPOSIT_PENDING";
  const depositFailed = order.payment?.status === "DEPOSIT_FAILED";
  const cancellable = ["AWAITING_DEPOSIT", "DEPOSIT_PENDING", "CONFIRMED"].includes(order.status);

  async function cancel(formData: FormData) {
    "use server";
    await cancelOrderAction(formData);
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={`Commande ${order.orderNumber}`}
        subtitle={`Passée le ${formatDate(order.createdAt)}`}
        backHref="/dashboard/orders"
        action={<StatusBadge status={order.status} />}
      />

      {cancelled && (
        <Card className="rounded-2xl border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <p className="font-medium text-white">Commande {order.status === "REFUNDED" ? "remboursée" : "annulée"}</p>
              {order.cancellationReason && <p className="mt-1 text-sm text-luxury-muted">{order.cancellationReason}</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          {/* Deposit action */}
          {(needsDeposit || depositPending) && (
            <Card className="rounded-2xl">
              <h2 className="mb-1 flex items-center gap-2 text-lg font-serif text-white">
                <Wallet className="h-5 w-5 text-gold-400" /> Acompte
              </h2>
              {depositFailed && needsDeposit && (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  Votre acompte n&apos;a pas pu être validé.{order.adminNotes ? ` Motif : ${order.adminNotes}.` : ""} Merci de renvoyer une preuve.
                </p>
              )}
              {needsDeposit ? (
                <>
                  <p className="mb-4 text-sm text-luxury-muted">
                    Réglez {formatPrice(pricing.deposit)} pour confirmer votre commande, puis envoyez la preuve de paiement.
                  </p>
                  <DepositProofForm orderId={order.id} methods={methods} defaultMethod={defaultMethod} />
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-luxury-border bg-luxury-dark/50 p-4">
                  <Clock className="mt-0.5 h-5 w-5 text-gold-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Preuve en cours de vérification</p>
                    <p className="mt-1 text-sm text-luxury-muted">
                      Référence : {order.payment?.proofReference ?? "—"}. Vous serez notifié dès la confirmation.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Timeline */}
          {!cancelled && rank >= 1 && (
            <Card className="rounded-2xl">
              <h2 className="mb-4 text-lg font-serif text-white">Suivi</h2>
              <ol className="space-y-4">
                {TIMELINE.map((step, i) => {
                  const reached = rank >= i;
                  const Icon = step.Icon;
                  return (
                    <li key={step.key} className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${reached ? "bg-gold-500 text-black" : "border border-luxury-border text-luxury-muted"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={reached ? "text-sm text-white" : "text-sm text-luxury-muted"}>{step.label}</span>
                    </li>
                  );
                })}
              </ol>
            </Card>
          )}

          {/* Items */}
          <Card className="rounded-2xl">
            <h2 className="mb-4 text-lg font-serif text-white">Articles</h2>
            <div className="space-y-3">
              {order.items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-luxury-light">{i.productName} <span className="text-luxury-muted">×{i.quantity}</span></span>
                  <span className="text-luxury-light">{formatPrice(Number(i.total))}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Payment summary */}
          <Card className="rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-serif text-white">Paiement</h2>
              {order.payment && <StatusBadge status={order.payment.status} />}
            </div>
            <PriceBreakdown {...pricing} hideNote />
          </Card>

          {/* Delivery */}
          {order.address && (
            <Card className="rounded-2xl">
              <h2 className="mb-3 text-lg font-serif text-white">Livraison</h2>
              <p className="text-sm text-white">{order.address.firstName} {order.address.lastName}</p>
              <p className="text-sm text-luxury-muted">{order.address.street}, {order.address.city} {order.address.postalCode}</p>
              <p className="text-sm text-luxury-muted">{order.customerPhone ?? order.address.phone}</p>
            </Card>
          )}

          {/* Cancel */}
          {cancellable && (
            <Card className="rounded-2xl">
              <form action={cancel} className="space-y-3">
                <input type="hidden" name="orderId" value={order.id} />
                <input name="reason" placeholder="Motif d'annulation (facultatif)" className="input-luxury w-full" />
                <SubmitButton variant="ghost">Annuler ma commande</SubmitButton>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
