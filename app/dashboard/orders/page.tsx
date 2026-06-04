import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ShoppingBag, ChevronRight, Truck } from "lucide-react";

export const metadata = { title: "Mes commandes" };

// 0=created 1=confirmed 2=preparing 3=shipped 4=outfordelivery 5=delivered
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

const STEP_LABELS = ["Créée", "Confirmée", "Préparation", "Expédiée", "Livraison", "Livrée"];
const TOTAL_STEPS = STEP_LABELS.length; // 6 steps (indices 0–5)

function MiniProgress({ rank }: { rank: number }) {
  if (rank < 0) return null;
  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              rank > i
                ? "bg-gold-500"
                : rank === i
                ? "bg-gold-500/60"
                : "bg-luxury-border"
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-luxury-muted">
        {STEP_LABELS[Math.min(rank, TOTAL_STEPS - 1)]}
        {rank === TOTAL_STEPS - 1 ? " ✓" : ""}
      </p>
    </div>
  );
}

export default async function DashboardOrdersPage() {
  const session = await requireAuth();
  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mes commandes"
        subtitle="Suivez vos commandes, paiements et livraisons."
        backHref="/dashboard"
      />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-luxury-border bg-white shadow-card">
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Aucune commande"
            description="Vos commandes apparaîtront ici dès votre premier achat."
          />
        </div>
      ) : (
        <>
          {/* Mobile — card list */}
          <div className="space-y-3 lg:hidden">
            {orders.map((order) => {
              const rank = rankFor(order.status);
              const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
              const inTransit = ["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.orderNumber}`}
                  className="block active:scale-[0.99] transition-transform"
                >
                  <div className="rounded-2xl border border-luxury-border bg-white shadow-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-luxury-white">{order.orderNumber}</p>
                          {inTransit && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                              <Truck className="h-2.5 w-2.5" /> En route
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-luxury-muted">
                          {formatDate(order.createdAt)} · {order.items.length} article{order.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-semibold text-luxury-white">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} />
                      {order.payment && <StatusBadge status={order.payment.status} />}
                    </div>
                    {Number(order.remainingBalance) > 0 && (
                      <p className="mt-2 text-xs text-luxury-muted">
                        Reste à la livraison :{" "}
                        <span className="text-luxury-light">{formatPrice(Number(order.remainingBalance))}</span>
                      </p>
                    )}
                    {!cancelled && <MiniProgress rank={rank} />}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop — table */}
          <div className="hidden overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-luxury-border bg-luxury-dark text-xs uppercase tracking-[0.14em] text-luxury-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Commande</th>
                    <th className="px-5 py-4 font-medium">Progression</th>
                    <th className="px-5 py-4 font-medium">Statut</th>
                    <th className="px-5 py-4 font-medium">Paiement</th>
                    <th className="px-5 py-4 font-medium">Reste</th>
                    <th className="px-5 py-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border">
                  {orders.map((order) => {
                    const rank = rankFor(order.status);
                    const cancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
                    const inTransit = ["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-luxury-dark/30"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/dashboard/orders/${order.orderNumber}`}
                            className="flex items-center gap-2 font-medium text-luxury-white hover:text-gold-400 transition-colors"
                          >
                            {order.orderNumber}
                            {inTransit && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                <Truck className="h-2.5 w-2.5" /> En route
                              </span>
                            )}
                          </Link>
                          <p className="text-xs text-luxury-muted">
                            {formatDate(order.createdAt)} · {order.items.length} article{order.items.length === 1 ? "" : "s"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          {!cancelled ? (
                            <div className="w-32">
                              <div className="flex gap-0.5">
                                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full ${
                                      rank > i
                                        ? "bg-gold-500"
                                        : rank === i
                                        ? "bg-gold-500/50"
                                        : "bg-luxury-border"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="mt-1 text-[10px] text-luxury-muted">
                                {STEP_LABELS[Math.min(rank, TOTAL_STEPS - 1)]}
                              </p>
                            </div>
                          ) : (
                            <span className="text-luxury-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4">
                          {order.payment
                            ? <StatusBadge status={order.payment.status} />
                            : <span className="text-luxury-muted">—</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-luxury-muted">
                          {Number(order.remainingBalance) > 0
                            ? formatPrice(Number(order.remainingBalance))
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/orders/${order.orderNumber}`}
                            className="inline-flex items-center gap-1 font-semibold text-luxury-white hover:text-gold-400 transition-colors"
                          >
                            {formatPrice(order.total)}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
