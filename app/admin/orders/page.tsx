import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateOrderStatusAction } from "@/actions/orders";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Admin Orders" };

async function updateStatus(formData: FormData) {
  "use server";
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  await updateOrderStatusAction(orderId, status);
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { include: { profile: true } }, payment: true, items: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Order management</h1>
        <p className="mt-2 text-luxury-muted">Status changes are permission checked, persisted, notified, and audit logged.</p>
      </header>

      <Card className="overflow-hidden rounded-2xl" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Update</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-luxury-border">
                  <td className="px-5 py-4"><p className="font-medium text-white">{order.orderNumber}</p><p className="text-xs text-luxury-muted">{formatDate(order.createdAt)} / {order.items.length} items</p></td>
                  <td className="px-5 py-4 text-luxury-muted">{order.user.profile?.firstName} {order.user.profile?.lastName}<br />{order.user.email}</td>
                  <td className="px-5 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-4">{order.payment ? <StatusBadge status={order.payment.status} /> : <span className="text-luxury-muted">No payment</span>}</td>
                  <td className="px-5 py-4 font-medium text-white">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <form action={updateStatus} className="flex gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select name="status" defaultValue={order.status} className="input-luxury">
                        {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <SubmitButton>Save</SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
