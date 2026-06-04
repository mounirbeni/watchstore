import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/actions/auth";
import { ShoppingCart, User, Settings, LogOut, ChevronDown } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

async function getCartCount(userId: string): Promise<number> {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { _count: { select: { items: true } } },
  });
  return cart?._count?.items ?? 0;
}

const CATEGORIES = [
  { href: "/shop?category=homme", label: "Homme" },
  { href: "/shop?category=femme", label: "Femme" },
  { href: "/shop?category=sport", label: "Sport" },
  { href: "/shop?category=luxe", label: "Haute Horlogerie" },
  { href: "/shop?category=smart", label: "Smart" },
  { href: "/shop?category=pack", label: "Pack & Coffrets" },
  { href: "/shop?category=limited-edition", label: "Édition Limitée" },
];

export default async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.userId) : 0;

  return (
    <header className="sticky top-0 z-50 glass border-b border-luxury-border safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <span className="text-xl font-serif font-bold gold-text tracking-wide">ChronoCraft</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-luxury-light hover:text-luxury-white transition-colors font-medium">
              Accueil
            </Link>

            {/* Collection dropdown */}
            <div className="relative group">
              <Link
                href="/shop"
                className="flex items-center gap-1 text-sm text-luxury-light hover:text-luxury-white transition-colors font-medium py-5"
              >
                Collection
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              {/* Transparent bridge prevents gap between trigger and panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-52 bg-white border border-luxury-border rounded-xl shadow-card-hover overflow-hidden">
                  <Link
                    href="/shop"
                    className="block px-4 py-2.5 text-sm font-semibold text-luxury-white hover:bg-luxury-dark transition-colors border-b border-luxury-border"
                  >
                    Toutes les montres
                  </Link>
                  {CATEGORIES.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2.5 text-sm text-luxury-light hover:text-luxury-white hover:bg-luxury-dark transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/about" className="text-sm text-luxury-light hover:text-luxury-white transition-colors font-medium">
              À propos
            </Link>
            <Link href="/faq" className="text-sm text-luxury-light hover:text-luxury-white transition-colors font-medium">
              FAQ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user && <NotificationBell />}

            <Link
              href="/cart"
              className="relative p-2 text-luxury-light hover:text-luxury-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold-500 text-black text-[10px] flex items-center justify-center font-bold leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-luxury-dark transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-500">
                    {user.firstName[0]?.toUpperCase()}
                  </div>
                </button>

                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-luxury-border rounded-xl shadow-card-hover opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-luxury-border">
                    <p className="text-sm font-semibold text-luxury-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-luxury-muted truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-light hover:text-luxury-white hover:bg-luxury-dark transition-colors">
                      <User className="h-4 w-4" /> Mon espace
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-500 hover:text-gold-400 hover:bg-luxury-dark transition-colors">
                        <Settings className="h-4 w-4" /> Administration
                      </Link>
                    )}
                    <form action={logoutAction}>
                      <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-muted hover:text-luxury-white hover:bg-luxury-dark transition-colors">
                        <LogOut className="h-4 w-4" /> Déconnexion
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-sm text-luxury-light hover:text-luxury-white transition-colors px-3 py-1.5">
                  Connexion
                </Link>
                <Link href="/register" className="text-sm bg-luxury-white text-white px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
