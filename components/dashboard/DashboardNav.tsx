"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard, ShoppingBag, CalendarClock,
  Heart, User, Home, LogOut, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  user: NavUser;
  unreadCount?: number;
}

const items = [
  { href: "/dashboard",               label: "Vue d'ensemble",  Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders",        label: "Mes commandes",   Icon: ShoppingBag },
  { href: "/dashboard/reservations",  label: "Réservations",    Icon: CalendarClock },
  { href: "/dashboard/wishlist",      label: "Ma wishlist",     Icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications",   Icon: Bell },
  { href: "/dashboard/profile",       label: "Mon profil",      Icon: User },
];

export default function DashboardNav({ user, unreadCount = 0 }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col rounded-2xl border border-luxury-border bg-white shadow-card p-4 lg:sticky lg:top-24 lg:self-start">
      {/* Brand */}
      <Link href="/" className="mb-5 block px-2">
        <span className="block font-serif text-lg font-bold gold-text">ChronoCraft</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-luxury-muted">Espace client</span>
      </Link>

      {/* Profile card */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-luxury-border bg-luxury-dark p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/15 text-xs font-bold text-gold-500">
          {user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-luxury-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-[11px] text-luxury-muted">{user.email}</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="space-y-0.5">
        {items.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const isNotif = href === "/dashboard/notifications";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-gold-500/10 text-gold-500"
                  : "text-luxury-muted hover:bg-luxury-dark hover:text-luxury-white",
              )}
            >
              <Icon
                className={cn(
                  "h-[17px] w-[17px] shrink-0 transition-colors",
                  active ? "text-gold-500" : "text-luxury-muted group-hover:text-luxury-white",
                )}
              />
              <span className="flex-1">{label}</span>
              {isNotif && unreadCount > 0 && (
                <span className={cn(
                  "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  active ? "bg-gold-500 text-white" : "bg-red-500 text-white",
                )}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-4 space-y-0.5 border-t border-luxury-border pt-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-luxury-muted transition-colors hover:bg-luxury-dark hover:text-luxury-white"
        >
          <Home className="h-[17px] w-[17px] shrink-0 text-luxury-muted transition-colors group-hover:text-luxury-white" />
          Continuer mes achats
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-[17px] w-[17px] shrink-0" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
