import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateAdminOrderAction, reviewDepositAction } from "@/actions/orders";
import { calculateCustomerRisk, riskBadgeClass } from "@/lib/admin-risk";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Order Details" };

interface Props {
  params: Promise<{ orderId: string }>;
}

async function updateOrder(formData: FormData) {
  "use server";
  await updateAdminOrderAction(formData);
}

async function reviewDeposit(formData: FormData) {
  "use server";
  await reviewDepositAction(formData);
  redirect(`/admin/orders/${String(formData.get("orderId") ?? "")}`);
}

export default async function AdminOrderDetailPage({ params }: Props) {
  await requireAdmin();
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        include: {
          profile: true,
          addresses: true,
          orders: { include: { payment: true }, orderBy: { createdAt: "desc" } },
        },
      },
      address: true,
      payment: true,
      items: { include: { product: true } },
      reservation: true,
    },
  });

  if (!order) notFound();

  const auditLogs = await db.auditLog.findMany({
    where: { entity: "Order", entityId: order.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { include: { profile: true } } },
  });
  const risk = calculateCustomerRisk(order.user.orders);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Order operations</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">{order.orderNumber}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            {order.payment && <StatusBadge status={order.payment.status} />}
            <span className={`rounded-full border px-2.5 py-1 text-xs ${riskBadgeClass(risk.level)}`}>
              {risk.level} risk / {risk.score}
            </span>
          </div>
        </div>
        <Link href="/admin/orders" className="rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted transition hover:text-luxury-white">
          Back to orders
        </Link>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-luxury-white">Order control</h2>
          <form action={updateOrder} className="mt-4 grid gap-4">
            <input type="hidden" name="orderId" value={order.id} />
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm text-luxury-light">Status</span>
                <select name="status" defaultValue={order.status} className="input-luxury w-full">
                  {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-luxury-light">Customer phone</span>
                <input name="customerPhone" defaultValue={order.customerPhone ?? ""} className="input-luxury w-full" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-luxury-light">Tracking number</span>
                <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="input-luxury w-full" />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm text-luxury-light">Internal admin notes</span>
              <textarea name="adminNotes" defaultValue={order.adminNotes ?? ""} className="input-luxury min-h-28 w-full" />
            </label>
            <SubmitButton>Save order changes</SubmitButton>
          </form>

          {order.payment?.status === "DEPOSIT_PENDING" && (
            <div className="mt-5 rounded-2xl border border-gold-500/30 p-4 space-y-4">
              <div>
                <h3 className="font-medium text-luxury-white">Deposit approval required</h3>
                <p className="mt-0.5 text-sm text-luxury-muted">Method: {order.payment.method}</p>
              </div>
              {/* Proof image */}
              {order.payment.proofUrl?.startsWith("data:image") ? (
                <div className="overflow-hidden rounded-xl border border-luxury-border">
                  <p className="border-b border-luxury-border bg-luxury-dark px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-luxury-muted">
                    Payment receipt
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.payment.proofUrl}
                    alt="Payment receipt"
                    className="max-h-80 w-full object-contain bg-luxury-dark/50"
                  />
                </div>
              ) : order.payment.proofUrl ? (
                <a href={order.payment.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-400 hover:underline">
                  View proof →
                </a>
              ) : (
                <p className="text-sm text-luxury-muted">No proof image submitted.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <form action={reviewDeposit}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="decision" value="APPROVE" />
                  <SubmitButton>Approve deposit</SubmitButton>
                </form>
                <form action={reviewDeposit} className="flex flex-wrap gap-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="decision" value="REJECT" />
                  <input name="adminNote" className="input-luxury" placeholder="Rejection reason" />
                  <SubmitButton variant="ghost">Reject</SubmitButton>
                </form>
              </div>
            </div>
          )}
        </Card>

        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-luxury-white">Payment summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-6"><span className="text-luxury-muted">Subtotal</span><span className="text-luxury-white">{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-luxury-muted">Shipping</span><span className="text-luxury-white">{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-luxury-muted">Discount</span><span className="text-luxury-white">{formatPrice(order.discount)}</span></div>
            <div className="flex justify-between gap-6 border-t border-luxury-border pt-2"><span className="text-luxury-muted">Total</span><span className="text-luxury-white">{formatPrice(order.total)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-luxury-muted">Deposit</span><span className="text-gold-400">{formatPrice(order.depositAmount)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-luxury-muted">Remaining</span><span className="text-luxury-white">{formatPrice(order.remainingBalance)}</span></div>
          </div>
          <div className="mt-4 rounded-xl border border-luxury-border p-3 text-sm text-luxury-muted">
            <p>Method: <span className="text-luxury-light">{order.payment?.method ?? "No payment"}</span></p>
            <p>Proof: <span className="text-luxury-light">{order.payment?.proofUrl?.startsWith("data:image") ? "Image uploaded" : (order.payment?.transactionRef ?? "None")}</span></p>
            <p>Reviewed: <span className="text-luxury-light">{formatDate(order.payment?.reviewedAt ?? null)}</span></p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-luxury-white">Customer</h2>
          <div className="mt-4 text-sm text-luxury-muted">
            <p className="text-luxury-light">{order.user.profile?.firstName} {order.user.profile?.lastName}</p>
            <p>{order.user.email}</p>
            <p>{order.user.profile?.phone ?? "No profile phone"}</p>
            <p className="mt-3">Orders: {order.user.orders.length}</p>
            <p>Cancellations: {risk.cancellations}</p>
            <p>Failed payments: {risk.failedPayments}</p>
            <p>Risk reasons: {risk.reasons.join(", ") || "None"}</p>
          </div>
          <Link href={`/admin/customers/${order.userId}`} className="mt-4 inline-flex rounded-xl border border-gold-500/40 px-4 py-2 text-sm text-gold-400 transition hover:bg-gold-500/10">
            View customer
          </Link>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-luxury-white">Shipping</h2>
          <div className="mt-4 text-sm text-luxury-muted">
            {order.address ? (
              <>
                <p className="text-luxury-light">{order.address.firstName} {order.address.lastName}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state ?? ""} {order.address.postalCode}</p>
                <p>{order.address.country}</p>
                <p className="mt-3">Phone: {order.address.phone}</p>
              </>
            ) : <p>No shipping address.</p>}
            <p className="mt-3">Tracking: <span className="text-luxury-light">{order.trackingNumber ?? "Not assigned"}</span></p>
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-luxury-white">Timeline</h2>
          <div className="mt-4 space-y-2 text-sm text-luxury-muted">
            <p>Created: {formatDate(order.createdAt)}</p>
            <p>Confirmed: {formatDate(order.confirmedAt)}</p>
            <p>Preparing: {formatDate(order.preparingAt)}</p>
            <p>Out for delivery: {formatDate(order.outForDeliveryAt)}</p>
            <p>Delivered: {formatDate(order.deliveredAt)}</p>
            <p>Cancelled: {formatDate(order.cancelledAt)}</p>
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <h2 className="text-xl font-serif text-luxury-white">Order items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr><th className="py-3">Product</th><th className="py-3">Quantity</th><th className="py-3">Unit</th><th className="py-3">Total</th><th className="py-3">Stock now</th></tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-luxury-border">
                  <td className="py-3 text-luxury-white">{item.productName}</td>
                  <td className="py-3 text-luxury-muted">{item.quantity}</td>
                  <td className="py-3 text-luxury-muted">{formatPrice(item.unitPrice)}</td>
                  <td className="py-3 text-luxury-white">{formatPrice(item.total)}</td>
                  <td className="py-3 text-luxury-muted">{item.product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <h2 className="text-xl font-serif text-luxury-white">Order history</h2>
        <div className="mt-4 space-y-3">
          {auditLogs.length === 0 ? <p className="text-sm text-luxury-muted">No audit entries yet.</p> : auditLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-luxury-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-luxury-white">{log.action}</p>
                <p className="text-xs text-luxury-muted">{formatDate(log.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-luxury-muted">
                By {log.user?.profile ? `${log.user.profile.firstName} ${log.user.profile.lastName}` : log.user?.email ?? "System"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
