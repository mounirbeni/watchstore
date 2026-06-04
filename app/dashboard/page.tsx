import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { NotificationCategory } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatPrice, formatDate, timeAgo } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  ShoppingBag, CalendarClock, Heart, Bell,
  ChevronRight, User, ArrowRight,
  Zap, Check, Truck, CreditCard, TrendingUp,
  Activity, Shield, Package,
} from "lucide-react";

export const metadata = { title: "Tableau de bord" };

const ORDER_STEPS = ["Confirmée", "Préparation", "En livraison", "Livrée"] as const;

function getOrderStep(status: string): number {
  switch (status) {
    case "AWAITING_DEPOSIT":
    case "DEPOSIT_PENDING": return 0;
    case "DEPOSIT_PAID":
    case "CONFIRMED": return 1;
    case "PREPARING": return 2;
    case "OUT_FOR_DELIVERY": return 3;
    case "DELIVERED": return 4;
    default: return 0;
  }
}

function NotifIcon({ category }: { category: string }) {
  if (category === "ORDER") return <ShoppingBag className="h-3.5 w-3.5 text-gold-500" />;
  if (category === "PAYMENT") return <CreditCard className="h-3.5 w-3.5 text-emerald-500" />;
  if (category === "RESERVATION") return <CalendarClock className="h-3.5 w-3.5 text-blue-500" />;
  if (category === "SHIPPING") return <Truck className="h-3.5 w-3.5 text-purple-500" />;
  if (category === "SECURITY") return <Shield className="h-3.5 w-3.5 text-red-400" />;
  return <Bell className="h-3.5 w-3.5 text-luxury-muted" />;
}

export default async function DashboardPage() {
  const session = await requireAuth();

  const [orders, reservations, notifications, wishlist, profile] = await Promise.all([
    db.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { payment: true, items: { take: 1 } },
    }),
    db.reservation.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        product: {
          include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
        },
      },
    }),
    db.notification.findMany({
      where: {
        userId: session.userId,
        category: {
          in: [
            NotificationCategory.ORDER,
            NotificationCategory.PAYMENT,
            NotificationCategory.RESERVATION,
            NotificationCategory.SHIPPING,
            NotificationCategory.ACCOUNT,
            NotificationCategory.SECURITY,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.wishlist.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
          },
          orderBy: { addedAt: "desc" },
          take: 4,
        },
      },
    }),
    db.customerProfile.findUnique({ where: { userId: session.userId } }),
  ]);

  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "REFUNDED"].includes(o.status)
  );
  const pendingReservations = reservations.filter((r) => r.status === "PENDING").length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const wishlistCount = wishlist?.items.length ?? 0;
  const firstName = profile?.firstName ?? session.firstName;
  const totalOrders = profile?.orderCount ?? orders.length;

  const loyaltyLevel =
    totalOrders >= 10 ? "Platinum" :
    totalOrders >= 5 ? "Or" :
    totalOrders >= 2 ? "Argent" :
    "Membre";

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">

      {/* ━━━━━━━━━━━━━━━  HERO  ━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark px-5 py-6 sm:px-7 sm:py-8">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-500/6 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-gold-500/4 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-500/70">
                Espace Client
              </p>
              <h1 className="mt-1.5 font-serif text-2xl font-semibold text-luxury-white sm:text-3xl">
                Bonjour, {firstName}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-[11px] font-semibold text-gold-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  {loyaltyLevel}
                </span>
                {unreadCount > 0 && (
                  <Link
                    href="/dashboard/notifications"
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-100"
                  >
                    <Bell className="h-3 w-3" />
                    {unreadCount} notification{unreadCount > 1 ? "s" : ""}
                  </Link>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-500/40 bg-gold-500/15 text-[15px] font-bold text-gold-500 sm:h-14 sm:w-14 sm:text-base">
              {firstName[0]?.toUpperCase()}{session.lastName[0]?.toUpperCase()}
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-5 grid grid-cols-3 border-t border-luxury-border pt-4">
            <div className="py-1 text-center">
              <p className="font-serif text-xl font-semibold text-luxury-white">{activeOrders.length}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-luxury-muted">
                Commande{activeOrders.length !== 1 ? "s" : ""} active{activeOrders.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="border-x border-luxury-border py-1 text-center">
              <p className="font-serif text-xl font-semibold text-luxury-white">{wishlistCount}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-luxury-muted">Montres sauvegardées</p>
            </div>
            <div className="py-1 text-center">
              <p className="font-serif text-xl font-semibold text-luxury-white">{totalOrders}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-luxury-muted">Commandes totales</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━  ACTIVE ORDERS  ━━━━━━━━━━━━━━━ */}
      {activeOrders.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.20em] text-luxury-muted">
              Commandes actives
            </h2>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-[11px] font-semibold text-gold-500 transition-colors hover:text-gold-400"
            >
              Toutes <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeOrders.slice(0, 3).map((order) => {
              const step = getOrderStep(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.orderNumber}`}
                  className="group block rounded-2xl border border-luxury-border bg-white p-4 shadow-card transition-all hover:shadow-card-hover active:scale-[0.99] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-luxury-white">{order.orderNumber}</p>
                      <p className="mt-0.5 text-xs text-luxury-muted">
                        {formatDate(order.createdAt)} · {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={order.status} />
                      <ChevronRight className="h-4 w-4 text-luxury-muted transition-colors group-hover:text-gold-500" />
                    </div>
                  </div>

                  {/* Progress timeline */}
                  <div className="mt-5 pb-1">
                    {/* Dots + connector line */}
                    <div className="flex items-center">
                      {ORDER_STEPS.flatMap((_, i) => {
                        const done = i < step;
                        const active = i === step;
                        const items = [];
                        if (i > 0) {
                          items.push(
                            <div
                              key={`line-${i}`}
                              className={`flex-1 h-0.5 transition-colors ${i <= step ? "bg-gold-500" : "bg-luxury-border"}`}
                            />
                          );
                        }
                        items.push(
                          <div
                            key={`dot-${i}`}
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              done
                                ? "border-gold-500 bg-gold-500"
                                : active
                                ? "border-gold-500 bg-white shadow-gold-glow-sm"
                                : "border-luxury-border bg-white"
                            }`}
                          >
                            {done && <Check className="h-2.5 w-2.5 text-white" />}
                            {active && <div className="h-2 w-2 rounded-full bg-gold-500" />}
                          </div>
                        );
                        return items;
                      })}
                    </div>
                    {/* Labels */}
                    <div className="mt-1.5 grid grid-cols-4">
                      {ORDER_STEPS.map((label, i) => (
                        <span
                          key={label}
                          className={`text-center text-[9px] font-medium leading-tight ${
                            i <= step ? "text-gold-500" : "text-luxury-muted"
                          }`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {Number(order.remainingBalance) > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-luxury-border bg-luxury-dark px-3 py-2.5">
                      <span className="text-xs text-luxury-muted">Reste à la livraison</span>
                      <span className="text-xs font-semibold text-luxury-white">
                        {formatPrice(Number(order.remainingBalance))}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━  QUICK ACTIONS  ━━━━━━━━━━━━━━━ */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.20em] text-luxury-muted">
          Actions rapides
        </h2>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {(
            [
              { href: "/dashboard/orders", label: "Commandes", Icon: ShoppingBag, badge: 0 },
              { href: "/dashboard/reservations", label: "Réservations", Icon: CalendarClock, badge: 0 },
              { href: "/dashboard/wishlist", label: "Wishlist", Icon: Heart, badge: 0 },
              { href: "/dashboard/profile", label: "Mon profil", Icon: User, badge: 0 },
              { href: "/dashboard/notifications", label: "Alertes", Icon: Bell, badge: unreadCount },
              { href: "/shop", label: "Boutique", Icon: Zap, badge: 0 },
            ] as { href: string; label: string; Icon: React.ElementType; badge: number }[]
          ).map(({ href, label, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-luxury-border bg-white p-3.5 text-center shadow-card transition-all hover:shadow-card-hover active:scale-[0.98] sm:p-4"
            >
              {badge ? (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/10 transition-colors group-hover:bg-gold-500/18">
                <Icon className="text-gold-500" style={{ width: 18, height: 18 }} />
              </span>
              <span className="text-[11px] font-medium leading-tight text-luxury-white">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━  MAIN GRID  ━━━━━━━━━━━━━━━ */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.4fr_0.6fr]">

        {/* Activity Feed */}
        <section className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-luxury-border px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2">
              <Activity className="h-[15px] w-[15px] text-gold-500" />
              <h2 className="text-sm font-semibold text-luxury-white">Activité récente</h2>
            </div>
            <Link
              href="/dashboard/notifications"
              className="text-xs font-medium text-gold-500 transition-colors hover:text-gold-400"
            >
              Tout voir
            </Link>
          </div>

          <div className="divide-y divide-luxury-border">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Activity className="mx-auto mb-2 h-6 w-6 text-luxury-muted" />
                <p className="text-sm text-luxury-muted">Aucune activité récente</p>
              </div>
            ) : (
              notifications.slice(0, 7).map((notification) => {
                const isUnread = !notification.isRead;
                const iconBg =
                  notification.priority === "CRITICAL"
                    ? "bg-red-50"
                    : notification.priority === "IMPORTANT"
                    ? "bg-gold-500/10"
                    : "bg-luxury-dark";
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-luxury-dark/50 sm:px-5 ${
                      isUnread ? "bg-gold-500/[0.02]" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                    >
                      <NotifIcon category={notification.category} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium leading-snug ${
                            isUnread ? "text-luxury-white" : "text-luxury-light"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {isUnread && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-luxury-muted">
                        {notification.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-luxury-muted">
                        {timeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right column — Reservations + Wishlist */}
        <div className="space-y-4 sm:space-y-5">

          {/* Reservations */}
          <section className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-luxury-border px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="text-sm font-semibold text-luxury-white">Réservations</h2>
                {pendingReservations > 0 && (
                  <span className="rounded-full bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-500">
                    {pendingReservations}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/reservations"
                className="text-xs font-medium text-gold-500 transition-colors hover:text-gold-400"
              >
                Gérer
              </Link>
            </div>

            <div className="divide-y divide-luxury-border">
              {reservations.length === 0 ? (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-luxury-muted">Aucune réservation</p>
                  <Link
                    href="/shop"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-500 hover:text-gold-400"
                  >
                    Explorer <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5"
                  >
                    {reservation.product.images[0] ? (
                      <Image
                        src={reservation.product.images[0].url}
                        alt={reservation.product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-luxury-dark">
                        <Package className="h-4 w-4 text-luxury-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-luxury-white">
                        {reservation.product.name}
                      </p>
                      <p className="text-xs text-luxury-muted">
                        Exp. {formatDate(reservation.expiresAt)}
                      </p>
                    </div>
                    <StatusBadge status={reservation.status} />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Wishlist preview */}
          <section className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-luxury-border px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <Heart className="h-[15px] w-[15px] text-gold-500" />
                <h2 className="text-sm font-semibold text-luxury-white">Wishlist</h2>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-gold-500/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-500">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/wishlist"
                className="text-xs font-medium text-gold-500 transition-colors hover:text-gold-400"
              >
                Voir tout
              </Link>
            </div>

            {wishlistCount === 0 ? (
              <div className="px-5 py-6 text-center">
                <Heart className="mx-auto mb-2 h-5 w-5 text-luxury-muted" />
                <p className="text-sm text-luxury-muted">Wishlist vide</p>
                <Link
                  href="/shop"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-500 hover:text-gold-400"
                >
                  Explorer les montres <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-luxury-border">
                {wishlist?.items.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/produit/${item.product.slug}`}
                    className="group bg-white p-3 transition-colors hover:bg-luxury-dark/40"
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        width={120}
                        height={72}
                        className="mb-2 h-[72px] w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="mb-2 h-[72px] w-full rounded-lg bg-luxury-dark" />
                    )}
                    <p className="truncate text-[11px] font-semibold text-luxury-white">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gold-500">
                      {formatPrice(Number(item.product.price))}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━  ACCOUNT INSIGHTS  ━━━━━━━━━━━━━━━ */}
      <section className="rounded-2xl border border-luxury-border bg-luxury-dark px-5 py-4 sm:px-6 sm:py-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="text-sm font-semibold text-luxury-white">Aperçu du compte</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          <div>
            <p className="font-serif text-xl font-semibold text-luxury-white">{totalOrders}</p>
            <p className="mt-0.5 text-xs text-luxury-muted">Commandes totales</p>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-luxury-white">
              {formatPrice(Number(profile?.totalSpent ?? 0))}
            </p>
            <p className="mt-0.5 text-xs text-luxury-muted">Total dépensé</p>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-gold-500">{loyaltyLevel}</p>
            <p className="mt-0.5 text-xs text-luxury-muted">Niveau fidélité</p>
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-luxury-white">{wishlistCount}</p>
            <p className="mt-0.5 text-xs text-luxury-muted">Montres sauvegardées</p>
          </div>
        </div>
      </section>
    </div>
  );
}
