import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { setCustomerActiveAction } from "@/actions/admin";
import { calculateCustomerRisk, riskBadgeClass } from "@/lib/admin-risk";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Customer Details" };

interface Props {
  params: Promise<{ customerId: string }>;
}

async function setCustomerActive(userId: string, isActive: boolean) {
  "use server";
  await setCustomerActiveAction(userId, isActive);
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  await requireAdmin();
  const { customerId } = await params;

  const customer = await db.user.findFirst({
    where: { id: customerId, role: "CUSTOMER" },
    include: {
      profile: true,
      addresses: { orderBy: { createdAt: "desc" } },
      orders: {
        include: { payment: true, address: true, items: true },
        orderBy: { createdAt: "desc" },
      },
      reservations: {
        include: { product: true },
        orderBy: { createdAt: "desc" },
      },
      sessions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!customer) notFound();

  const auditLogs = await db.auditLog.findMany({
    where: { entity: "User", entityId: customer.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { include: { profile: true } } },
  });
  const risk = calculateCustomerRisk(customer.orders);
  const paidTotal = customer.orders
    .filter((order) => order.payment?.status === "DEPOSIT_PAID" || order.payment?.status === "PAID")
    .reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Customer profile</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-white">
            {customer.profile?.firstName ?? "No"} {customer.profile?.lastName ?? "Name"}
          </h1>
          <p className="mt-2 text-luxury-muted">{customer.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs ${riskBadgeClass(risk.level)}`}>{risk.level} risk / {risk.score}</span>
            <span className="rounded-full border border-luxury-border px-2.5 py-1 text-xs text-luxury-muted">{customer.isActive ? "Active" : "Suspended"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/customers" className="rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted transition hover:text-white">Back</Link>
          <form action={setCustomerActive.bind(null, customer.id, !customer.isActive)}>
            <SubmitButton variant={customer.isActive ? "danger" : "gold"}>
              {customer.isActive ? "Suspend account" : "Reactivate account"}
            </SubmitButton>
          </form>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Total spend</p><p className="mt-2 text-2xl font-semibold text-white">{formatPrice(paidTotal)}</p></Card>
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Orders</p><p className="mt-2 text-2xl font-semibold text-white">{customer.orders.length}</p></Card>
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Cancellations</p><p className="mt-2 text-2xl font-semibold text-white">{risk.cancellations}</p></Card>
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Delivery refusals</p><p className="mt-2 text-2xl font-semibold text-white">{risk.deliveryRefusals}</p></Card>
        <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">Failed payments</p><p className="mt-2 text-2xl font-semibold text-white">{risk.failedPayments}</p></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-white">Risk indicators</h2>
          <div className="mt-4 space-y-2 text-sm text-luxury-muted">
            <p>Orders in 24h: {risk.ordersLast24h}</p>
            <p>Flagged orders: {risk.flaggedOrders}</p>
            <p>Reasons: {risk.reasons.join(", ") || "No automatic risk indicators"}</p>
          </div>
        </Card>
        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-white">Security sessions</h2>
          <div className="mt-4 space-y-2 text-sm text-luxury-muted">
            {customer.sessions.length === 0 ? <p>No sessions found.</p> : customer.sessions.map((session) => (
              <p key={session.id}>{formatDate(session.createdAt)} / {session.ipAddress ?? "No IP"} / {session.revokedAt ? "Revoked" : "Active"}</p>
            ))}
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <h2 className="text-xl font-serif text-white">Order history</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr><th className="py-3">Order</th><th className="py-3">Date</th><th className="py-3">Status</th><th className="py-3">Payment</th><th className="py-3">Total</th><th className="py-3">Action</th></tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => (
                <tr key={order.id} className="border-t border-luxury-border">
                  <td className="py-3 text-white">{order.orderNumber}</td>
                  <td className="py-3 text-luxury-muted">{formatDate(order.createdAt)}</td>
                  <td className="py-3"><StatusBadge status={order.status} /></td>
                  <td className="py-3">{order.payment && <StatusBadge status={order.payment.status} />}</td>
                  <td className="py-3 text-white">{formatPrice(order.total)}</td>
                  <td className="py-3"><Link href={`/admin/orders/${order.id}`} className="text-gold-400 hover:text-gold-300">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-white">Addresses</h2>
          <div className="mt-4 space-y-3">
            {customer.addresses.length === 0 ? <p className="text-sm text-luxury-muted">No addresses.</p> : customer.addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">
                <p className="text-luxury-light">{address.label} {address.isDefault ? "/ Default" : ""}</p>
                <p>{address.firstName} {address.lastName} / {address.phone}</p>
                <p>{address.street}, {address.city}, {address.country}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-white">Reservations</h2>
          <div className="mt-4 space-y-3">
            {customer.reservations.length === 0 ? <p className="text-sm text-luxury-muted">No reservations.</p> : customer.reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-xl border border-luxury-border p-4 text-sm">
                <p className="text-white">{reservation.product.name}</p>
                <p className="text-luxury-muted">{reservation.status} / expires {formatDate(reservation.expiresAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <h2 className="text-xl font-serif text-white">Customer audit trail</h2>
        <div className="mt-4 space-y-3">
          {auditLogs.length === 0 ? <p className="text-sm text-luxury-muted">No customer audit entries.</p> : auditLogs.map((log) => (
            <div key={log.id} className="rounded-xl border border-luxury-border p-4">
              <p className="font-medium text-white">{log.action}</p>
              <p className="mt-1 text-sm text-luxury-muted">
                {formatDate(log.createdAt)} by {log.user?.profile ? `${log.user.profile.firstName} ${log.user.profile.lastName}` : log.user?.email ?? "System"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
