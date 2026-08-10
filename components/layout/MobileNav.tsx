"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  cartCount?: number;
  isAuthenticated?: boolean;
}

/**
 * App-style bottom tab bar. The active pill travels between tabs with a
 * shared-layout spring, icons lift and labels weight up — the small details
 * that make a mobile web store read as a native app.
 */
export default function MobileNav({ cartCount = 0, isAuthenticated = false }: MobileNavProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  const tabs = [
    { href: "/", label: "Accueil", icon: Home, match: (p: string) => p === "/" },
    {
      href: "/shop",
      label: "Boutique",
      icon: Search,
      match: (p: string) => p.startsWith("/shop") || p.startsWith("/products"),
    },
    {
      href: "/cart",
      label: "Panier",
      icon: ShoppingBag,
      match: (p: string) => p.startsWith("/cart"),
      badge: cartCount,
    },
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
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-luxury-border bg-white/95 backdrop-blur-xl md:hidden"
      style={{ boxShadow: "0 -8px 24px -20px rgba(0,0,0,0.55)" }}
      aria-label="Navigation rapide"
    >
      <ul className="flex h-[var(--mobile-nav-h)] items-stretch justify-around px-1 pt-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <li key={tab.label} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "relative mx-0.5 flex h-full flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95",
                  active ? "text-gold-600" : "text-luxury-muted hover:text-luxury-light",
                )}
                aria-current={active ? "page" : undefined}
              >
                {/* Travelling active pill */}
                {active &&
                  (prefersReduced ? (
                    <span className="absolute inset-x-1 bottom-1.5 top-1.5 rounded-xl bg-gold-500/10" />
                  ) : (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 36 }}
                      className="absolute inset-x-1 bottom-1.5 top-1.5 rounded-xl bg-gold-500/10"
                    />
                  ))}

                {/* Gold cap on the active tab */}
                {active && (
                  <motion.span
                    layoutId={prefersReduced ? undefined : "tab-cap"}
                    transition={{ type: "spring", stiffness: 460, damping: 36 }}
                    className="absolute -top-px h-[3px] w-8 rounded-full bg-gold-500"
                  />
                )}

                <motion.span
                  className="relative z-10"
                  animate={prefersReduced ? undefined : { y: active ? -1 : 0, scale: active ? 1.06 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                >
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
                  <AnimatePresence>
                    {tab.badge ? (
                      <motion.span
                        key={tab.badge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 520, damping: 20 }}
                        className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold leading-none text-black"
                      >
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </motion.span>

                <span
                  className={cn(
                    "relative z-10 text-[10px] transition-all",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
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
