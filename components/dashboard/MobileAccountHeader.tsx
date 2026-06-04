import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import {
  Package,
  CalendarClock,
  Heart,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  TrendingUp,
} from "lucide-react";

interface Props {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  counts?: {
    orders?: number;
    reservations?: number;
    wishlist?: number;
    notifications?: number;
  };
  loyaltyLevel?: string;
  totalSpent?: number;
}

export default function MobileAccountHeader({
  firstName,
  lastName,
  email,
  isAdmin,
  counts = {},
  loyaltyLevel = "Membre",
}: Props) {
  const rows = [
    { href: "/dashboard/orders",        label: "Mes commandes",     Icon: Package,       badge: counts.orders },
    { href: "/dashboard/reservations",  label: "Mes réservations",  Icon: CalendarClock, badge: counts.reservations },
    { href: "/dashboard/wishlist",      label: "Ma wishlist",       Icon: Heart,         badge: counts.wishlist },
    { href: "/dashboard/notifications", label: "Notifications",     Icon: Bell,          badge: counts.notifications },
    { href: "/dashboard/profile",       label: "Mon profil",        Icon: User,          badge: undefined as number | undefined },
  ];

  return (
    <section className="lg:hidden space-y-3">
      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark px-5 py-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold-500/6 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gold-500/40 bg-gold-500/15 text-lg font-bold text-gold-500">
            {firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-lg font-semibold text-luxury-white truncate">
              {firstName} {lastName}
            </h1>
            <p className="text-sm text-luxury-muted truncate">{email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-500">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {loyaltyLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 rounded-2xl border border-luxury-border bg-white shadow-card overflow-hidden">
        {[
          { label: "Commandes", value: counts.orders ?? 0 },
          { label: "Réservations", value: counts.reservations ?? 0 },
          { label: "Wishlist", value: counts.wishlist ?? 0 },
        ].map((stat, i) => (
          <div key={stat.label} className={`py-3 text-center ${i > 0 ? "border-l border-luxury-border" : ""}`}>
            <p className="font-serif text-xl font-semibold text-luxury-white">{stat.value}</p>
            <p className="mt-0.5 text-[10px] text-luxury-muted leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Nav list */}
      <nav className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card divide-y divide-luxury-border">
        {rows.map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-luxury-dark/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
              <Icon className="h-[17px] w-[17px] text-gold-500" />
            </span>
            <span className="flex-1 text-[14px] font-medium text-luxury-white">{label}</span>
            {badge ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-500/20 px-1.5 text-[10px] font-bold text-gold-500">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
            <ChevronRight className="h-4 w-4 shrink-0 text-luxury-muted" />
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-luxury-dark/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
              <Settings className="h-[17px] w-[17px] text-gold-500" />
            </span>
            <span className="flex-1 text-[14px] font-semibold text-gold-500">Administration</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-luxury-muted" />
          </Link>
        )}
      </nav>

      {/* Loyalty info */}
      <div className="flex items-center gap-3 rounded-2xl border border-luxury-border bg-white px-4 py-3.5 shadow-card">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
          <TrendingUp className="h-[17px] w-[17px] text-gold-500" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-luxury-white">Niveau {loyaltyLevel}</p>
          <p className="text-[11px] text-luxury-muted">Programme de fidélité ChronoCraft</p>
        </div>
      </div>

      {/* Logout */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-3.5 text-[14px] font-medium text-red-500 shadow-card transition-colors active:bg-red-50"
        >
          <LogOut className="h-[17px] w-[17px]" />
          Déconnexion
        </button>
      </form>
    </section>
  );
}
