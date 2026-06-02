import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice, timeAgo } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import MobileAccountHeader from "@/components/dashboard/MobileAccountHeader";
import { ShoppingBag, CalendarClock, Heart, Bell } from "lucide-react";

export const metadata = { title: "Vue d'ensemble" };

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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Espace client</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">
          Bonjour, {profile?.firstName ?? session.firstName}
        </h1>
        <p className="mt-2 text-luxury-muted">
          Retrouvez vos commandes, réservations, montres sauvegardées et notifications en un coup d&apos;œil.
        </p>
      </header>

      <section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        <StatCard label="Commandes en cours" value={activeOrders} detail={`${orders.length} au total`} Icon={ShoppingBag} />
        <StatCard label="Réservations" value={pendingReservations} detail="En attente" Icon={CalendarClock} />
        <StatCard label="Wishlist" value={wishlist?.items.length ?? 0} detail="Montres sauvegardées" Icon={Heart} />
        <StatCard label="Notifications" value={unreadNotifications} detail="Non lues" Icon={Bell} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-serif text-white">Commandes récentes</h2>
            <Link href="/dashboard/orders" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">Tout voir</Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">Aucune commande pour le moment.</p>
            ) : orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-luxury-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{order.orderNumber}</p>
                  <p className="text-sm text-luxury-muted">
                    {order.items.length} article{order.items.length === 1 ? "" : "s"} · {formatPrice(order.total)}
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-serif text-white">Notifications</h2>
            <Link href="/dashboard/notifications" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">Tout voir</Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-luxury-muted">Aucune notification.</p>
            ) : notifications.map((notification) => (
              <article key={notification.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium text-white">{notification.title}</h3>
                  {!notification.isRead && <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs text-gold-400">Nouveau</span>}
                </div>
                <p className="mt-2 text-sm text-luxury-muted">{notification.message}</p>
                <p className="mt-2 text-xs text-luxury-muted">{timeAgo(notification.createdAt)}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-serif text-white">Réservations</h2>
          <Link href="/dashboard/reservations" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">Gérer</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {reservations.length === 0 ? (
            <p className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">Aucune réservation pour le moment.</p>
          ) : reservations.map((reservation) => (
            <article key={reservation.id} className="rounded-xl border border-luxury-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{reservation.product.name}</h3>
                  <p className="mt-1 text-sm text-luxury-muted">Expire le {formatDate(reservation.expiresAt)}</p>
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
