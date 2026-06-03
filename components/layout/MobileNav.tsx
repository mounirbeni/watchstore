"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

export default function MobileNav({ cartCount = 0, isAuthenticated = false }: MobileNavProps) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Accueil", icon: Home, match: (p: string) => p === "/" },
    { href: "/shop", label: "Boutique", icon: Search, match: (p: string) => p.startsWith("/shop") || p.startsWith("/products") },
    { href: "/cart", label: "Panier", icon: ShoppingBag, match: (p: string) => p.startsWith("/cart"), badge: cartCount },
    {
      href: isAuthenticated ? "/dashboard/wishlist" : "/login",
      label: "Favoris",
      icon: Heart,
      match: (p: string) => p.startsWith("/dashboard/wishlist"),
    },
    {
      href: isAuthenticated ? "/dashboard" : "/login",
      label: "Compte",
      icon: User,
      match: (p: string) => p.startsWith("/dashboard") && !p.startsWith("/dashboard/wishlist"),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-luxury-border safe-bottom"
      style={{ boxShadow: "0 -1px 0 #E8E8E6" }}
      aria-label="Navigation principale"
    >
      <ul className="flex items-stretch justify-around px-1 pt-1 h-[var(--mobile-nav-h)]">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-full rounded-xl mx-0.5 transition-colors active:scale-95",
                  active ? "text-gold-500" : "text-luxury-muted hover:text-luxury-light",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                  {tab.badge ? (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-gold-500 text-black text-[9px] font-bold flex items-center justify-center leading-none">
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </span>
                  ) : null}
                </span>
                <span className={cn("text-[10px] font-medium", active ? "text-gold-500" : "text-luxury-muted")}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
