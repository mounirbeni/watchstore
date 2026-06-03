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

const items = [
  { href: "/dashboard",               label: "Vue d'ensemble",  Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders",        label: "Mes commandes",   Icon: ShoppingBag },
  { href: "/dashboard/reservations",  label: "Réservations",    Icon: CalendarClock },
  { href: "/dashboard/wishlist",      label: "Ma wishlist",     Icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications",   Icon: Bell },
  { href: "/dashboard/profile",       label: "Mon profil",      Icon: User },
];

export default function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col rounded-2xl border border-luxury-border bg-white shadow-card p-4 lg:sticky lg:top-24 lg:self-start">
      <Link href="/" className="mb-5 block px-2">
        <span className="block font-serif text-lg font-bold gold-text">ChronoCraft</span>
        <span className="text-[11px] uppercase tracking-[0.20em] text-luxury-muted">Espace client</span>
      </Link>

      {/* Profile */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-luxury-dark border border-luxury-border p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 border border-gold-500/30 text-sm font-bold text-gold-500">
          {user.firstName[0]?.toUpperCase()}{user.lastName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-luxury-white">{user.firstName} {user.lastName}</p>
          <p className="truncate text-xs text-luxury-muted">{user.email}</p>
        </div>
      </div>

      <nav className="space-y-0.5">
        {items.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold-500/10 text-gold-500"
                  : "text-luxury-muted hover:bg-luxury-dark hover:text-luxury-white",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] transition-colors shrink-0", active ? "text-gold-500" : "text-luxury-muted group-hover:text-luxury-white")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-0.5 border-t border-luxury-border pt-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-luxury-muted transition-colors hover:bg-luxury-dark hover:text-luxury-white"
        >
          <Home className="h-[18px] w-[18px] text-luxury-muted group-hover:text-luxury-white transition-colors shrink-0" />
          Continuer mes achats
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
