import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/actions/auth";
import { ShoppingCart, User, Settings, LogOut } from "lucide-react";

async function getCartCount(userId: string): Promise<number> {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { _count: { select: { items: true } } },
  });
  return cart?._count?.items ?? 0;
}

export default async function Header() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.userId) : 0;

  return (
    <header className="sticky top-0 z-50 glass border-b border-luxury-border safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <span className="text-xl font-serif gold-text font-bold tracking-wide">ChronoCraft</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-sm text-luxury-light hover:text-gold-400 transition-colors">
              Collection
            </Link>
            <Link href="/shop?category=homme" className="text-sm text-luxury-light hover:text-gold-400 transition-colors">
              Homme
            </Link>
            <Link href="/shop?category=femme" className="text-sm text-luxury-light hover:text-gold-400 transition-colors">
              Femme
            </Link>
            <Link href="/shop?category=luxe" className="text-sm text-luxury-light hover:text-gold-400 transition-colors">
              Haute Horlogerie
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-luxury-light hover:text-gold-400 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 p-2 text-luxury-light hover:text-gold-400 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-400">
                    {user.firstName[0]?.toUpperCase()}
                  </div>
                </button>

                <div className="absolute right-0 top-full mt-1 w-52 bg-luxury-card border border-luxury-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-luxury-border">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-luxury-muted truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-light hover:text-white hover:bg-luxury-border/50 transition-colors">
                      <User className="h-4 w-4" /> Mon espace
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-400 hover:text-gold-300 hover:bg-luxury-border/50 transition-colors">
                        <Settings className="h-4 w-4" /> Administration
                      </Link>
                    )}
                    <form action={logoutAction}>
                      <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-muted hover:text-white hover:bg-luxury-border/50 transition-colors">
                        <LogOut className="h-4 w-4" /> Déconnexion
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-sm text-luxury-light hover:text-gold-400 transition-colors px-3 py-1.5">
                  Connexion
                </Link>
                <Link href="/register" className="text-sm bg-gold-500 text-black px-3 py-1.5 rounded-lg font-medium hover:bg-gold-400 transition-colors">
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
