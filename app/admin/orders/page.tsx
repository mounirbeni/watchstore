import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { reviewDepositAction, updateOrderStatusAction } from "@/actions/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";
import { AlertTriangle, Check, ExternalLink, Phone } from "lucide-react";

export const metadata = { title: "Commandes" };

async function reviewDeposit(formData: FormData) {
  "use server";
  await reviewDepositAction(formData);
}

async function updateStatus(formData: FormData) {
  "use server";
  await updateOrderStatusAction(formData);
}

const FULFILMENT_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "DEPOSIT_PENDING", label: "À vérifier" },
  { value: "AWAITING_DEPOSIT", label: "Acompte requis" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "PREPARING", label: "En préparation" },
  { value: "OUT_FOR_DELIVERY", label: "En livraison" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELLED", label: "Annulées" },
];

interface Props { searchParams: Promise<{ status?: string }> }

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = status && status !== "all" ? status : "all";

  const where = active !== "all" ? { status: active as OrderStatus } : {};
  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: [{ flagged: "desc" }, { createdAt: "desc" }],
      include: { user: { include: { profile: true } }, payment: true, items: true, address: true },
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Console admin</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Gestion des commandes</h1>
        <p className="mt-2 text-luxury-muted">Vérifiez les acomptes, confirmez et suivez les livraisons. Toutes les données proviennent de la base.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.value;
          const count = f.value === "all" ? undefined : countByStatus[f.value];
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/orders" : `/admin/orders?status=${f.value}`}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                isActive ? "bg-gold-500 text-black font-medium" : "border border-luxury-border text-luxury-muted hover:text-white"
              }`}
            >
              {f.label}{count ? ` (${count})` : ""}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Aucune commande dans cette catégorie.</p></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const deposit = Number(order.depositAmount);
            const remaining = Number(order.remainingBalance);
            const needsReview = order.payment?.status === "DEPOSIT_PENDING";

            return (
              <Card key={order.id} className="rounded-2xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: order + customer */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      {order.payment && <StatusBadge status={order.payment.status} />}
                      {order.flagged && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                          <AlertTriangle className="h-3 w-3" /> Risque
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-luxury-light">
                      {order.user.profile?.firstName ?? ""} {order.user.profile?.lastName ?? ""} · {order.user.email}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-luxury-muted">
                      <Phone className="h-3 w-3" /> {order.customerPhone ?? order.address?.phone ?? "—"}
                      {order.address && <span> · {order.address.city}</span>}
                    </p>
                    <p className="text-xs text-luxury-muted">
                      {formatDate(order.createdAt)} · {order.items.length} article{order.items.length === 1 ? "" : "s"}
                      {order.flagged && order.riskNote ? ` · ⚠ ${order.riskNote}` : ""}
                      {order.ipAddress ? ` · IP ${order.ipAddress}` : ""}
                    </p>
                  </div>

                  {/* Right: money */}
                  <div className="shrink-0 rounded-xl border border-luxury-border bg-luxury-dark/50 p-3 text-sm">
                    <div className="flex justify-between gap-6"><span className="text-luxury-muted">Total</span><span className="text-white">{formatPrice(Number(order.total))}</span></div>
                    <div className="flex justify-between gap-6"><span className="text-luxury-muted">Acompte</span><span className="text-gold-400">{formatPrice(deposit)}</span></div>
                    <div className="flex justify-between gap-6"><span className="text-luxury-muted">Reste (livraison)</span><span className="text-white">{formatPrice(remaining)}</span></div>
                  </div>
                </div>

                {/* Deposit proof + review */}
                {order.payment?.proofReference && (
                  <div className="mt-4 rounded-xl border border-luxury-border p-3 text-sm">
                    <p className="text-luxury-muted">
                      Preuve ({order.payment.method}) : <span className="text-luxury-light">{order.payment.proofReference}</span>
                      {order.payment.proofUrl && (
                        <a href={order.payment.proofUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-gold-400 hover:text-gold-300">
                          reçu <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-3 border-t border-luxury-border pt-4 lg:flex-row lg:items-end lg:justify-between">
                  {needsReview ? (
                    <div className="flex flex-wrap items-end gap-2">
                      <form action={reviewDeposit}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="APPROVE" />
                        <SubmitButton>Valider l&apos;acompte</SubmitButton>
                      </form>
                      <form action={reviewDeposit} className="flex items-end gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="decision" value="REJECT" />
                        <input name="adminNote" placeholder="Motif du refus" className="input-luxury text-sm" />
                        <SubmitButton variant="ghost">Refuser</SubmitButton>
                      </form>
                    </div>
                  ) : (
                    <p className="flex items-center gap-1 text-xs text-luxury-muted">
                      {order.payment?.status === "DEPOSIT_PAID" && <><Check className="h-3 w-3 text-green-400" /> Acompte validé</>}
                    </p>
                  )}

                  {/* Fulfilment status */}
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select name="status" defaultValue={FULFILMENT_STATUSES.includes(order.status) ? order.status : OrderStatus.CONFIRMED} className="input-luxury text-sm">
                      {FULFILMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <SubmitButton variant="outline">Mettre à jour</SubmitButton>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
