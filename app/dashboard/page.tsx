import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice, timeAgo } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import MobileAccountHeader from "@/components/dashboard/MobileAccountHeader";

export const metadata = { title: "Client Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const [orders, reservations, notifications, wishlist, profile] = await Promise.all([
    db.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { payment: true, items: true },
    }),
    db.reservation.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { product: true },
    }),
    db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.wishlist.findUnique({
      where: { userId: session.userId },
      include: { items: true },
    }),
    db.customerProfile.findUnique({ where: { userId: session.userId } }),
  ]);

  const activeOrders = orders.filter((order) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)).length;
  const pendingReservations = reservations.filter((reservation) => reservation.status === "PENDING").length;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="space-y-6">
      <MobileAccountHeader
        firstName={profile?.firstName ?? session.firstName}
        lastName={session.lastName}
        email={session.email}
        isAdmin={session.role === "ADMIN"}
        counts={{
          orders: orders.length,
          reservations: reservations.length,
          wishlist: wishlist?.items.length ?? 0,
        }}
      />

      <header className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Client portal</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">
          Welcome, {profile?.firstName ?? session.firstName}
        </h1>
        <p className="mt-2 text-luxury-muted">
          Your orders, reservations, saved watches, notifications, and account security are pulled from your account records.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current orders" value={activeOrders} detail={`${orders.length} total orders`} />
        <StatCard label="Reservations" value={pendingReservations} detail="Pending review" />
        <StatCard label="Wishlist" value={wishlist?.items.length ?? 0} detail="Saved watches" />
        <StatCard label="Notifications" value={unreadNotifications} detail="Unread messages" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-serif text-white">Recent orders</h2>
              <p className="text-sm text-luxury-muted">Only orders owned by your authenticated user id are shown.</p>
            </div>
            <Link href="/dashboard/orders" className="text-sm text-gold-400 hover:text-gold-300">View all</Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">No orders yet.</p>
            ) : orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-luxury-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{order.orderNumber}</p>
                  <p className="text-sm text-luxury-muted">
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} / {formatPrice(order.total)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  {order.payment && <StatusBadge status={order.payment.status} />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-serif text-white">Notifications</h2>
            <p className="text-sm text-luxury-muted">System, payment, reservation, and order messages.</p>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-luxury-muted">No notifications.</p>
            ) : notifications.map((notification) => (
              <article key={notification.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-white">{notification.title}</h3>
                  {!notification.isRead && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs text-gold-400">New</span>}
                </div>
                <p className="mt-2 text-sm text-luxury-muted">{notification.message}</p>
                <p className="mt-2 text-xs text-luxury-muted">{timeAgo(notification.createdAt)}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif text-white">Reservations</h2>
            <p className="text-sm text-luxury-muted">Reservations are database records with expiration and review status.</p>
          </div>
          <Link href="/dashboard/reservations" className="text-sm text-gold-400 hover:text-gold-300">Manage</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {reservations.length === 0 ? (
            <p className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">No reservations yet.</p>
          ) : reservations.map((reservation) => (
            <article key={reservation.id} className="rounded-xl border border-luxury-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{reservation.product.name}</h3>
                  <p className="mt-1 text-sm text-luxury-muted">Expires {formatDate(reservation.expiresAt)}</p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
