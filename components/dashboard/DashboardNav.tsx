"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarClock,
  Heart,
  User,
  Home,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavUser {
  firstName: string;
  lastName: string;
  email: string;
}

const items = [
  { href: "/dashboard", label: "Vue d'ensemble", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Mes commandes", Icon: ShoppingBag },
  { href: "/dashboard/reservations", label: "Réservations", Icon: CalendarClock },
  { href: "/dashboard/wishlist", label: "Ma wishlist", Icon: Heart },
  { href: "/dashboard/profile", label: "Mon profil", Icon: User },
];

export default function DashboardNav({ user }: { user: NavUser }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col rounded-2xl border border-luxury-border bg-luxury-card p-4 lg:sticky lg:top-6 lg:self-start">
      <Link href="/" className="mb-4 block px-2">
        <span className="block font-serif text-lg font-bold gold-text">ChronoCraft</span>
        <span className="text-[11px] uppercase tracking-[0.22em] text-luxury-muted">Espace client</span>
      </Link>

      {/* Profile */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-luxury-dark/60 border border-luxury-border p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/15 border border-gold-500/40 text-sm font-bold text-gold-400">
          {user.firstName[0]?.toUpperCase()}
          {user.lastName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs text-luxury-muted">{user.email}</p>
        </div>
      </div>

      <nav className="space-y-1">
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
                  ? "bg-gold-500/15 text-gold-400"
                  : "text-luxury-muted hover:bg-luxury-border/50 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  active ? "text-gold-400" : "text-luxury-muted group-hover:text-gold-400",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-luxury-border pt-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-luxury-muted transition-colors hover:bg-luxury-border/50 hover:text-white"
        >
          <Home className="h-[18px] w-[18px] text-luxury-muted group-hover:text-gold-400 transition-colors" />
          Continuer mes achats
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-luxury-border/50 hover:text-red-300"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
