import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ShoppingBag, ChevronRight } from "lucide-react";

export const metadata = { title: "Mes commandes" };

export default async function DashboardOrdersPage() {
  const session = await requireAuth();
  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, address: true },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mes commandes"
        subtitle="Suivez vos commandes, paiements et livraisons."
        backHref="/dashboard"
      />

      {orders.length === 0 ? (
        <Card className="rounded-2xl" padding="none">
          <EmptyState
            icon={<ShoppingBag className="h-7 w-7" />}
            title="Aucune commande"
            description="Vos commandes apparaîtront ici dès votre premier achat."
          />
        </Card>
      ) : (
        <>
          {/* Mobile — card list */}
          <div className="space-y-3 lg:hidden">
            {orders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.orderNumber}`} className="block active:scale-[0.99] transition-transform">
                <Card className="rounded-2xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-luxury-white">{order.orderNumber}</p>
                      <p className="text-xs text-luxury-muted">
                        {formatDate(order.createdAt)} · {order.items.length} article{order.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="whitespace-nowrap font-semibold text-luxury-white">{formatPrice(order.total)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} />
                    {order.payment && <StatusBadge status={order.payment.status} />}
                  </div>
                  {Number(order.remainingBalance) > 0 && (
                    <p className="mt-2 text-xs text-luxury-muted">
                      Reste à la livraison : <span className="text-luxury-light">{formatPrice(Number(order.remainingBalance))}</span>
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>

          {/* Desktop — table */}
          <Card className="hidden overflow-hidden rounded-2xl lg:block" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Commande</th>
                    <th className="px-5 py-4 font-medium">Statut</th>
                    <th className="px-5 py-4 font-medium">Paiement</th>
                    <th className="px-5 py-4 font-medium">Reste à payer</th>
                    <th className="px-5 py-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-luxury-border transition-colors hover:bg-luxury-border/20">
                      <td className="px-5 py-4">
                        <Link href={`/dashboard/orders/${order.orderNumber}`} className="font-medium text-luxury-white hover:text-gold-400 transition-colors">{order.orderNumber}</Link>
                        <p className="text-xs text-luxury-muted">{formatDate(order.createdAt)} · {order.items.length} article{order.items.length === 1 ? "" : "s"}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-4">{order.payment ? <StatusBadge status={order.payment.status} /> : <span className="text-luxury-muted">—</span>}</td>
                      <td className="px-5 py-4 text-luxury-muted">{Number(order.remainingBalance) > 0 ? formatPrice(Number(order.remainingBalance)) : "—"}</td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/dashboard/orders/${order.orderNumber}`} className="inline-flex items-center gap-1 text-gold-400 hover:text-gold-300">
                          {formatPrice(order.total)} <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
