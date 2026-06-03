import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatPrice, timeAgo } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Admin Dashboard" };

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function AdminPage() {
  await requireAdmin();

  const now = new Date();
  const today = startOfDay(now);
  const week = new Date(now);
  week.setDate(now.getDate() - 7);
  const month = startOfMonth(now);

  const [
    todayRevenue,
    weeklyRevenue,
    monthlyRevenue,
    totalRevenue,
    ordersToday,
    ordersThisMonth,
    totalOrders,
    newCustomers,
    activeCustomers,
    depositApprovals,
    failedPayments,
    lowStock,
    outOfStock,
    recentOrders,
    recentCustomers,
    recentPayments,
    bestSellingItems,
    unreadAdminNotifications,
  ] = await Promise.all([
    db.payment.aggregate({ where: { status: { in: [PaymentStatus.DEPOSIT_PAID, PaymentStatus.PAID] }, paidAt: { gte: today } }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: { in: [PaymentStatus.DEPOSIT_PAID, PaymentStatus.PAID] }, paidAt: { gte: week } }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: { in: [PaymentStatus.DEPOSIT_PAID, PaymentStatus.PAID] }, paidAt: { gte: month } }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: { in: [PaymentStatus.DEPOSIT_PAID, PaymentStatus.PAID] } }, _sum: { amount: true } }),
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.order.count({ where: { createdAt: { gte: month } } }),
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: month } } }),
    db.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    db.payment.count({ where: { status: PaymentStatus.DEPOSIT_PENDING } }),
    db.payment.count({ where: { status: { in: [PaymentStatus.FAILED, PaymentStatus.DEPOSIT_FAILED] } } }),
    db.product.findMany({ where: { isActive: true, stock: { lt: 10 } }, orderBy: { stock: "asc" }, take: 8 }),
    db.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
    db.order.findMany({ orderBy: [{ flagged: "desc" }, { createdAt: "desc" }], take: 6, include: { user: { include: { profile: true } }, payment: true } }),
    db.user.findMany({ where: { role: "CUSTOMER" }, orderBy: { createdAt: "desc" }, take: 5, include: { profile: true } }),
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { order: true, user: { include: { profile: true } } } }),
    db.orderItem.groupBy({ by: ["productId", "productName"], _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: "desc" } }, take: 6 }),
    db.notification.count({ where: { isRead: false, user: { role: "ADMIN" } } }),
  ]);

  const totalRevenueNumber = Number(totalRevenue._sum.amount ?? 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenueNumber / totalOrders : 0;
  const conversionNote = totalOrders > 0
    ? `${Math.round((ordersThisMonth / Math.max(activeCustomers, 1)) * 100)}% order/customer ratio this month`
    : "No order conversion data yet";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Business control center</h1>
        <p className="mt-2 text-luxury-muted">Revenue, operations, customers, inventory, payments, and alerts from database records only.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today revenue" value={formatPrice(todayRevenue._sum.amount ?? 0)} detail={`${ordersToday} orders today`} />
        <StatCard label="Weekly revenue" value={formatPrice(weeklyRevenue._sum.amount ?? 0)} detail="Paid payments last 7 days" />
        <StatCard label="Monthly revenue" value={formatPrice(monthlyRevenue._sum.amount ?? 0)} detail={`${ordersThisMonth} orders this month`} />
        <StatCard label="Total revenue" value={formatPrice(totalRevenue._sum.amount ?? 0)} detail="Paid payments all time" />
        <StatCard label="Average order" value={formatPrice(averageOrderValue)} detail={conversionNote} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="New customers" value={newCustomers} detail="This month" />
        <StatCard label="Active customers" value={activeCustomers} detail="Customer accounts" />
        <StatCard label="Deposit reviews" value={depositApprovals} detail="Need admin approval" />
        <StatCard label="Failed payments" value={failedPayments} detail="Fraud/payment queue" />
        <StatCard label="Out of stock" value={outOfStock} detail={`${lowStock.length} low stock alerts`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-serif text-luxury-white">Operations queue</h2>
              <p className="text-sm text-luxury-muted">Orders that need payment, fulfilment, or risk review.</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-gold-400 hover:text-gold-300">Manage</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-col gap-3 rounded-xl border border-luxury-border p-4 transition hover:border-gold-500/40 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-luxury-white">{order.orderNumber}</p>
                  <p className="text-sm text-luxury-muted">{order.user.profile?.firstName} {order.user.profile?.lastName} / {formatPrice(order.total)}</p>
                </div>
                <div className="flex flex-wrap gap-2"><StatusBadge status={order.status} />{order.payment && <StatusBadge status={order.payment.status} />}</div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-serif text-luxury-white">Inventory alerts</h2>
              <p className="text-sm text-luxury-muted">Automatic thresholds: under 10, under 5, and out of stock.</p>
            </div>
            <Link href="/admin/inventory" className="text-sm text-gold-400 hover:text-gold-300">Inventory</Link>
          </div>
          <div className="space-y-3">
            {lowStock.length === 0 ? <p className="text-sm text-luxury-muted">No low stock products.</p> : lowStock.map((product) => (
              <div key={product.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-luxury-white">{product.name}</p>
                    <p className="text-sm text-luxury-muted">SKU {product.sku ?? "n/a"}</p>
                  </div>
                  <span className="rounded-full bg-gold-500/20 px-3 py-1 text-sm text-gold-400">{product.stock} left</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-luxury-white">Best selling products</h2>
          <div className="space-y-3">
            {bestSellingItems.length === 0 ? <p className="text-sm text-luxury-muted">No sales yet.</p> : bestSellingItems.map((item) => (
              <div key={item.productId} className="rounded-xl border border-luxury-border p-4">
                <p className="font-medium text-luxury-white">{item.productName}</p>
                <p className="text-sm text-luxury-muted">{item._sum.quantity ?? 0} units / {formatPrice(item._sum.total ?? 0)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-luxury-white">Recent customers</h2>
          <div className="space-y-3">
            {recentCustomers.map((user) => (
              <Link key={user.id} href={`/admin/customers/${user.id}`} className="block rounded-xl border border-luxury-border p-4 transition hover:border-gold-500/40">
                <p className="font-medium text-luxury-white">{user.profile?.firstName} {user.profile?.lastName}</p>
                <p className="text-sm text-luxury-muted">{user.email} / joined {timeAgo(user.createdAt)}</p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-luxury-white">Admin alerts</h2>
          <div className="space-y-3">
            <Link href="/admin/notifications" className="block rounded-xl border border-luxury-border p-4 transition hover:border-gold-500/40">
              <p className="font-medium text-luxury-white">{unreadAdminNotifications} unread notifications</p>
              <p className="text-sm text-luxury-muted">New orders, deposits, stock, fraud, and system messages.</p>
            </Link>
            {recentPayments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-luxury-border p-4">
                <p className="font-medium text-luxury-white">{payment.order.orderNumber}</p>
                <p className="text-sm text-luxury-muted">{payment.user.profile?.firstName} {payment.user.profile?.lastName} / {formatPrice(payment.amount)}</p>
                <div className="mt-2"><StatusBadge status={payment.status} /></div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
