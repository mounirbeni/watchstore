import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const metadata = { title: "My Orders" };

export default async function DashboardOrdersPage() {
  const session = await requireAuth();
  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, address: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Client portal</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">My orders</h1>
        <p className="mt-2 text-luxury-muted">Invoices, receipts, payment status, and delivery status from your order records.</p>
      </header>

      <Card className="overflow-hidden rounded-2xl" padding="none">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-luxury-muted">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Delivery</th>
                  <th className="px-5 py-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-luxury-border">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{order.orderNumber}</p>
                      <p className="text-xs text-luxury-muted">{formatDate(order.createdAt)} / {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-4">{order.payment ? <StatusBadge status={order.payment.status} /> : <span className="text-luxury-muted">No payment</span>}</td>
                    <td className="px-5 py-4 text-luxury-muted">{order.trackingNumber ?? order.address?.city ?? "Pending"}</td>
                    <td className="px-5 py-4 font-medium text-white">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
