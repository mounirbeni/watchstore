"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings, LogOut, ChevronRight } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface MenuUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const COLLECTION_LINKS: [string, string][] = [
  ["Toute la collection", "/shop"],
  ["Homme", "/shop?category=homme"],
  ["Femme", "/shop?category=femme"],
  ["Sport", "/shop?category=sport"],
  ["Haute Horlogerie", "/shop?category=luxe"],
];

export default function MobileMenu({ user }: { user: MenuUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -mr-2 text-luxury-light hover:text-white active:scale-90 transition-transform"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`md:hidden fixed top-0 right-0 z-[70] h-full w-[82%] max-w-sm glass border-l border-luxury-border shadow-2xl transition-transform duration-300 ease-out flex flex-col safe-top ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-luxury-border">
          <span className="text-lg font-serif gold-text font-bold tracking-wide">ChronoCraft</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 text-luxury-muted hover:text-white active:scale-90 transition-transform"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {/* Account header */}
          {user ? (
            <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-luxury-card border border-luxury-border">
              <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-sm font-bold text-gold-400">
                {user.firstName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-luxury-muted truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href="/login"
                className="text-center text-sm border border-gold-500/50 text-gold-400 px-3 py-2.5 rounded-xl font-medium active:scale-95 transition-transform"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-center text-sm bg-gold-500 text-black px-3 py-2.5 rounded-xl font-semibold active:scale-95 transition-transform"
              >
                S&apos;inscrire
              </Link>
            </div>
          )}

          <p className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-[0.2em] text-luxury-muted">
            Collection
          </p>
          <nav className="space-y-0.5">
            {COLLECTION_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-luxury-light hover:bg-luxury-border/40 active:bg-luxury-border/60 transition-colors"
              >
                <span className="text-[15px]">{label}</span>
                <ChevronRight className="h-4 w-4 text-luxury-muted" />
              </Link>
            ))}
          </nav>

          {user && (
            <>
              <p className="px-3 pt-5 pb-1 text-[11px] uppercase tracking-[0.2em] text-luxury-muted">
                Mon espace
              </p>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-luxury-light hover:bg-luxury-border/40 transition-colors"
                >
                  <User className="h-[18px] w-[18px] text-luxury-muted" />
                  <span className="text-[15px]">Tableau de bord</span>
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gold-400 hover:bg-luxury-border/40 transition-colors"
                  >
                    <Settings className="h-[18px] w-[18px]" />
                    <span className="text-[15px]">Administration</span>
                  </Link>
                )}
              </nav>
            </>
          )}
        </div>

        {user && (
          <div className="border-t border-luxury-border p-3 safe-bottom">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-luxury-muted hover:text-white hover:bg-luxury-border/40 transition-colors text-[15px]"
              >
                <LogOut className="h-[18px] w-[18px]" /> Déconnexion
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}
