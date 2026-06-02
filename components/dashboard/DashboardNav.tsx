import Link from "next/link";
import { logoutAction } from "@/actions/auth";

type Item = {
  href: string;
  label: string;
};

const clientItems: Item[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/reservations", label: "Reservations" },
  { href: "/dashboard/wishlist", label: "Wishlist" },
  { href: "/dashboard/profile", label: "Account" },
];

const adminItems: Item[] = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/audit", label: "Audit logs" },
];

export default function DashboardNav({ role }: { role: "client" | "admin" }) {
  const items = role === "admin" ? adminItems : clientItems;
  return (
    <aside className="rounded-2xl border border-luxury-border bg-luxury-card p-4 lg:sticky lg:top-6 lg:self-start">
      <Link href="/" className="mb-5 block">
        <span className="block text-sm font-semibold tracking-[0.24em] text-white">CHRONOCRAFT</span>
        <span className="text-xs uppercase tracking-[0.2em] text-gold-400">
          {role === "admin" ? "Admin Console" : "Client Portal"}
        </span>
      </Link>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-luxury-muted transition hover:bg-luxury-border hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction} className="mt-5 hidden lg:block">
        <button className="w-full rounded-xl border border-luxury-border px-3 py-2 text-left text-sm text-luxury-muted transition hover:text-white">
          Logout
        </button>
      </form>
    </aside>
  );
}
