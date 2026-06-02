import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Calendar, FileText, LogOut, Settings,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Administration", template: "%s | Admin" } };

const navItems = [
  { href: "/admin",              label: "Vue d'ensemble", Icon: LayoutDashboard },
  { href: "/admin/products",     label: "Produits",       Icon: Package },
  { href: "/admin/orders",       label: "Commandes",      Icon: ShoppingBag },
  { href: "/admin/reservations", label: "Réservations",   Icon: Calendar },
  { href: "/admin/customers",    label: "Clients",        Icon: Users },
  { href: "/admin/audit",        label: "Audit",          Icon: FileText },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    redirect("/login?from=/admin");
  }

  return (
    <div className="min-h-screen bg-luxury-black flex">
      <aside className="w-64 shrink-0 bg-luxury-dark border-r border-luxury-border hidden md:flex flex-col">
        <div className="p-6 border-b border-luxury-border">
          <Link href="/" className="text-xl font-serif font-bold gold-text">ChronoCraft</Link>
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <Settings className="h-3 w-3" /> Administration
          </p>
        </div>
        <div className="p-4 border-b border-luxury-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-sm font-bold text-red-400">
              {session.firstName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.firstName} {session.lastName}</p>
              <p className="text-xs text-red-400">Administrateur</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-luxury-muted hover:text-white hover:bg-luxury-border/50 transition-colors group">
              <Icon className="h-4 w-4 group-hover:text-gold-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-luxury-border">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-luxury-muted hover:text-white hover:bg-luxury-border/50 transition-colors mb-2">
            <Users className="h-4 w-4" /> Espace client
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-luxury-border/50 transition-colors">
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
