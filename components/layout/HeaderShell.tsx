"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { NAV_CATEGORIES, PRIMARY_LINKS } from "./nav-data";
import { cn } from "@/lib/utils";

export interface HeaderUser {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

interface HeaderShellProps {
  user: HeaderUser | null;
  cartCount: number;
  /** Server-rendered <NotificationBell />, injected so this stays a pure shell. */
  notifications?: React.ReactNode;
  /** `<form action={logoutAction}>` supplied by the server component. */
  logoutForm: React.ReactNode;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export default function HeaderShell({ user, cartCount, notifications, logoutForm }: HeaderShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const megaTimer = useRef<number | null>(null);

  // Condense the bar once the hero scrolls past.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes every transient surface.
  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Lock the page behind the mobile drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setMegaOpen(false);
        setSearchOpen(false);
      }
      // ⌘K / Ctrl-K jumps straight to search, as in any modern storefront.
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 120);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setSearchOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0] ?? href);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 safe-top transition-[background-color,box-shadow,border-color] duration-300",
          scrolled
            ? "glass-strong border-b border-luxury-border shadow-[0_6px_24px_-18px_rgba(0,0,0,0.45)]"
            : "glass border-b border-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-300",
              scrolled ? "h-14" : "h-16 sm:h-[4.5rem]",
            )}
          >
            {/* ── Left: burger (mobile) + logo ─────────────────── */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Ouvrir le menu"
                aria-expanded={drawerOpen}
                className="-ml-1.5 rounded-xl p-2 text-luxury-light transition-colors hover:bg-luxury-dark hover:text-luxury-white md:hidden"
              >
                <Menu className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </button>
              <Logo size={scrolled ? "sm" : "md"} />
            </div>

            {/* ── Centre: desktop nav ──────────────────────────── */}
            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
              {PRIMARY_LINKS.map((link) => {
                const active = isActive(link.href);
                const isCollection = link.href === "/shop";
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={isCollection ? openMega : undefined}
                    onMouseLeave={isCollection ? closeMega : undefined}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "relative flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                        active ? "text-luxury-white" : "text-luxury-light hover:text-luxury-white",
                      )}
                    >
                      {link.label}
                      {isCollection && (
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            megaOpen && "rotate-180",
                          )}
                        />
                      )}
                      {active && !prefersReduced && (
                        <motion.span
                          layoutId="nav-underline"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-gold-500"
                        />
                      )}
                      {active && prefersReduced && (
                        <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-gold-500" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* ── Right: actions ───────────────────────────────── */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Rechercher une montre"
                aria-expanded={searchOpen}
                className="rounded-xl p-2 text-luxury-light transition-colors hover:bg-luxury-dark hover:text-luxury-white"
              >
                <Search className="h-[20px] w-[20px]" strokeWidth={1.8} />
              </button>

              {notifications}

              <Link
                href="/cart"
                aria-label={`Panier${cartCount > 0 ? ` — ${cartCount} article(s)` : ""}`}
                className="relative rounded-xl p-2 text-luxury-light transition-colors hover:bg-luxury-dark hover:text-luxury-white"
              >
                <ShoppingBag className="h-[20px] w-[20px]" strokeWidth={1.8} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-black"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {user ? (
                <div className="group relative hidden md:block">
                  <button
                    type="button"
                    aria-label="Mon compte"
                    className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-luxury-dark"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/15 text-xs font-bold text-gold-600">
                      {user.firstName[0]?.toUpperCase()}
                    </span>
                  </button>

                  <div className="invisible absolute right-0 top-full z-50 w-56 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card-hover">
                      <div className="border-b border-luxury-border px-4 py-3">
                        <p className="text-sm font-semibold text-luxury-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="truncate text-xs text-luxury-muted">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-light transition-colors hover:bg-luxury-dark hover:text-luxury-white"
                        >
                          <User className="h-4 w-4" /> Mon espace
                        </Link>
                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-600 transition-colors hover:bg-luxury-dark hover:text-gold-500"
                          >
                            <Settings className="h-4 w-4" /> Administration
                          </Link>
                        )}
                        {logoutForm}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="ml-1 hidden items-center gap-2 md:flex">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm font-medium text-luxury-light transition-colors hover:text-luxury-white"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="sheen rounded-xl bg-luxury-white px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop mega-menu ──────────────────────────────── */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: EASE }}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              className="absolute inset-x-0 top-full hidden border-b border-luxury-border bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] md:block"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] gap-10 px-6 py-8">
                <div>
                  <p className="eyebrow mb-5">Nos collections</p>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1.5">
                    {NAV_CATEGORIES.map(({ href, label, hint, Icon }, i) => (
                      <motion.div
                        key={href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: EASE, delay: 0.03 * i }}
                      >
                        <Link
                          href={href}
                          className="group/item flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-luxury-dark"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-luxury-border bg-white transition-colors group-hover/item:border-gold-500/40 group-hover/item:bg-gold-500/10">
                            <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.8} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-luxury-white">{label}</span>
                            <span className="block truncate text-xs text-luxury-muted">{hint}</span>
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="sheen group/promo flex w-64 flex-col justify-between rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-50 to-white p-5"
                >
                  <div>
                    <p className="eyebrow">Toute la maison</p>
                    <p className="mt-2 font-serif text-2xl font-bold leading-tight text-luxury-white">
                      Explorer le <span className="gold-text">catalogue</span>
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-luxury-muted">
                      Filtres par style, budget et disponibilité — livraison partout au Maroc.
                    </p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600">
                    Voir tout
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/promo:translate-x-1" />
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Slide-down search ──────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="overflow-hidden border-t border-luxury-border bg-white"
            >
              <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6">
                <Search className="h-5 w-5 shrink-0 text-gold-500" strokeWidth={1.8} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  name="q"
                  placeholder="Rechercher une montre, une marque, un style…"
                  className="min-w-0 flex-1 bg-transparent text-base text-luxury-white outline-none placeholder:text-luxury-muted"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-400"
                >
                  Chercher
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Fermer la recherche"
                  className="shrink-0 rounded-lg p-2 text-luxury-muted transition-colors hover:text-luxury-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[90] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl md:hidden"
              aria-label="Menu"
            >
              <div className="safe-top flex items-center justify-between border-b border-luxury-border px-5 py-4">
                <Logo size="sm" withTagline />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fermer le menu"
                  className="rounded-xl p-2 text-luxury-light transition-colors hover:bg-luxury-dark"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-luxury-muted">
                  Navigation
                </p>
                {PRIMARY_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-gold-500/10 text-gold-600"
                          : "text-luxury-white hover:bg-luxury-dark",
                      )}
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 opacity-40" />
                    </Link>
                  </motion.div>
                ))}

                <p className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-luxury-muted">
                  Collections
                </p>
                {NAV_CATEGORIES.map(({ href, label, hint, Icon }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.035, duration: 0.3, ease: EASE }}
                  >
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-luxury-dark active:scale-[0.99]"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-luxury-border bg-white">
                        <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-luxury-white">{label}</span>
                        <span className="block truncate text-xs text-luxury-muted">{hint}</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="safe-bottom border-t border-luxury-border px-5 py-4">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 rounded-xl bg-luxury-dark px-4 py-3 text-sm font-medium text-luxury-white"
                    >
                      <User className="h-4 w-4 text-gold-500" />
                      {user.firstName} {user.lastName}
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-gold-600"
                      >
                        <Settings className="h-4 w-4" /> Administration
                      </Link>
                    )}
                    <div className="[&_button]:w-full [&_button]:justify-start">{logoutForm}</div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      className="flex-1 rounded-xl border border-luxury-border py-3 text-center text-sm font-medium text-luxury-white"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 rounded-xl bg-gold-500 py-3 text-center text-sm font-bold text-black"
                    >
                      S&apos;inscrire
                    </Link>
                  </div>
                )}
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-luxury-muted">
                  <Truck className="h-3.5 w-3.5" />
                  Livraison partout au Maroc · Paiement à la livraison
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
