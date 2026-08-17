"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Grid2X2, MonitorPlay, Warehouse,
  ShoppingBag, Calendar, Users, Tag, Bell, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin",               label: "Overview",        Icon: LayoutDashboard },
  { href: "/admin/products",      label: "Products",      Icon: Package },
  { href: "/admin/categories",    label: "Categories",    Icon: Grid2X2 },
  { href: "/admin/hero",          label: "Hero",          Icon: MonitorPlay },
  { href: "/admin/inventory",     label: "Inventory",    Icon: Warehouse },
  { href: "/admin/orders",        label: "Orders",     Icon: ShoppingBag },
  { href: "/admin/reservations",  label: "Reservations",  Icon: Calendar },
  { href: "/admin/customers",     label: "Customers",       Icon: Users },
  { href: "/admin/promos",        label: "Promos",        Icon: Tag },
  { href: "/admin/notifications", label: "Alerts",        Icon: Bell },
  { href: "/admin/audit",         label: "Audit",         Icon: FileText },
];

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden sticky top-[var(--admin-bar-h,3.5rem)] z-30 border-b border-luxury-border bg-white/95 backdrop-blur-sm"
      aria-label="Navigation admin"
    >
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-3 py-2">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:scale-95",
                active
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-600"
                  : "border-luxury-border bg-white text-luxury-light hover:text-luxury-white",
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", active ? "text-gold-500" : "text-luxury-muted")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
