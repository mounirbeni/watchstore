import Link from "next/link";
import { ReservationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatPrice, timeAgo } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  await requireAdmin();

  const [
    revenue,
    totalOrders,
    pendingReservations,
    activeCustomers,
    lowStock,
    recentOrders,
    recentCustomers,
    recentPayments,
  ] = await Promise.all([
    db.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.order.count(),
    db.reservation.count({ where: { status: ReservationStatus.PENDING } }),
    db.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    db.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 6 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { include: { profile: true } }, payment: true } }),
    db.user.findMany({ where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, take: 5, include: { profile: true } }),
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { order: true, user: { include: { profile: true } } } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Business control center</h1>
        <p className="mt-2 text-luxury-muted">Every metric below is calculated from database records.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Revenue" value={formatPrice(revenue._sum.amount ?? 0)} detail="Paid payments" />
        <StatCard label="Orders" value={totalOrders} detail="All time" />
        <StatCard label="Reservations" value={pendingReservations} detail="Pending review" />
        <StatCard label="Customers" value={activeCustomers} detail="Active accounts" />
        <StatCard label="Low stock" value={lowStock.length} detail="Needs inventory action" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-serif text-white">Recent orders</h2>
              <p className="text-sm text-luxury-muted">Live order records with customer and payment state.</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-gold-400 hover:text-gold-300">Manage</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-luxury-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{order.orderNumber}</p>
                  <p className="text-sm text-luxury-muted">{order.user.profile?.firstName} {order.user.profile?.lastName} / {formatPrice(order.total)}</p>
                </div>
                <div className="flex gap-2"><StatusBadge status={order.status} />{order.payment && <StatusBadge status={order.payment.status} />}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-serif text-white">Low stock alerts</h2>
            <p className="text-sm text-luxury-muted">Products at or below stock threshold.</p>
          </div>
          <div className="space-y-3">
            {lowStock.length === 0 ? <p className="text-sm text-luxury-muted">No low stock products.</p> : lowStock.map((product) => (
              <div key={product.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-luxury-muted">SKU {product.sku ?? "n/a"}</p>
                  </div>
                  <span className="rounded-full bg-gold-500/20 px-3 py-1 text-sm text-gold-400">{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Recent customers</h2>
          <div className="space-y-3">
            {recentCustomers.map((user) => (
              <div key={user.id} className="rounded-xl border border-luxury-border p-4">
                <p className="font-medium text-white">{user.profile?.firstName} {user.profile?.lastName}</p>
                <p className="text-sm text-luxury-muted">{user.email} / joined {timeAgo(user.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Recent payments</h2>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-3 rounded-xl border border-luxury-border p-4">
                <div>
                  <p className="font-medium text-white">{payment.order.orderNumber}</p>
                  <p className="text-sm text-luxury-muted">{payment.user.profile?.firstName} {payment.user.profile?.lastName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatPrice(payment.amount)}</p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
