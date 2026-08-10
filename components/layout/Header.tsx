import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { logoutAction } from "@/actions/auth";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import HeaderShell, { type HeaderUser } from "./HeaderShell";

async function getCartCount(userId: string): Promise<number> {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
      include: { _count: { select: { items: true } } },
    });
    return cart?._count?.items ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Server half of the site header: resolves auth + cart state, then hands
 * serializable props to the interactive shell.
 */
export default async function Header() {
  const session = await getCurrentUser();
  const cartCount = session ? await getCartCount(session.userId) : 0;

  const user: HeaderUser | null = session
    ? {
        firstName: session.firstName,
        lastName: session.lastName,
        email: session.email,
        isAdmin: session.role === "ADMIN",
      }
    : null;

  return (
    <HeaderShell
      user={user}
      cartCount={cartCount}
      notifications={session ? <NotificationBell /> : null}
      logoutForm={
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-luxury-muted transition-colors hover:bg-luxury-dark hover:text-luxury-white"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </form>
      }
    />
  );
}
