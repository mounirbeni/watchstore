import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import MobileNav from "./MobileNav";

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
 * Server wrapper that supplies live cart + auth state to the bottom tab bar.
 * Drop this into any shopping-surface layout.
 */
export default async function MobileTabBar() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.userId) : 0;

  return <MobileNav cartCount={cartCount} isAuthenticated={Boolean(user)} />;
}
