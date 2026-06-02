import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import ProductCard from "@/components/shop/ProductCard";
import Card from "@/components/ui/Card";

export const metadata = { title: "Wishlist" };

export default async function DashboardWishlistPage() {
  const session = await requireAuth();
  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } } } },
  });
  const products = wishlist?.items.map((item) => item.product).filter((product) => product.isActive) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Client portal</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Wishlist</h1>
        <p className="mt-2 text-luxury-muted">Saved watches from your database-backed wishlist.</p>
      </header>

      {products.length === 0 ? (
        <Card><p className="text-sm text-luxury-muted">Your wishlist is empty.</p></Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
