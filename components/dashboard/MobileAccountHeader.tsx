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
  };
}

/**
 * Native-style account screen shown only on mobile (the Compte tab root).
 * Replaces the desktop sidebar nav, which is hidden below lg.
 */
export default function MobileAccountHeader({
  firstName,
  lastName,
  email,
  isAdmin,
  counts = {},
}: Props) {
  const rows = [
    { href: "/dashboard/orders", label: "Mes commandes", Icon: Package, badge: counts.orders },
    { href: "/dashboard/reservations", label: "Mes réservations", Icon: CalendarClock, badge: counts.reservations },
    { href: "/dashboard/wishlist", label: "Ma wishlist", Icon: Heart, badge: counts.wishlist },
    { href: "/dashboard/notifications", label: "Notifications", Icon: Bell, badge: undefined as number | undefined },
    { href: "/dashboard/profile", label: "Mon profil", Icon: User, badge: undefined as number | undefined },
  ];

  return (
    <section className="lg:hidden space-y-4">
      {/* Profile header */}
      <div className="card-luxury rounded-2xl p-5 bg-luxury-dark flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-xl font-bold text-gold-400 shrink-0">
          {firstName[0]?.toUpperCase()}
          {lastName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-serif font-semibold text-luxury-white truncate">
            {firstName} {lastName}
          </h1>
          <p className="text-sm text-luxury-muted truncate">{email}</p>
        </div>
      </div>

      {/* List rows */}
      <nav className="card-luxury rounded-2xl overflow-hidden divide-y divide-luxury-border">
        {rows.map(({ href, label, Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3.5 active:bg-luxury-border/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
              <Icon className="h-[18px] w-[18px] text-gold-400" />
            </span>
            <span className="flex-1 text-[15px] text-luxury-white">{label}</span>
            {badge ? (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-semibold flex items-center justify-center">
                {badge}
              </span>
            ) : null}
            <ChevronRight className="h-4 w-4 text-luxury-muted" />
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3.5 active:bg-luxury-border/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
              <Settings className="h-[18px] w-[18px] text-gold-400" />
            </span>
            <span className="flex-1 text-[15px] text-gold-400 font-medium">Administration</span>
            <ChevronRight className="h-4 w-4 text-luxury-muted" />
          </Link>
        )}
      </nav>

      {/* Logout */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 card-luxury rounded-2xl px-4 py-3.5 text-red-400 active:bg-luxury-border/40 transition-colors text-[15px] font-medium"
        >
          <LogOut className="h-[18px] w-[18px]" /> Déconnexion
        </button>
      </form>
    </section>
  );
}
