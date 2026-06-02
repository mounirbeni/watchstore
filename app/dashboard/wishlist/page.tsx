import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import ProductCard from "@/components/shop/ProductCard";
import Card from "@/components/ui/Card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";

export const metadata = { title: "Ma wishlist" };

export default async function DashboardWishlistPage() {
  const session = await requireAuth();
  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } } } },
  });
  const products = wishlist?.items.map((item) => item.product).filter((product) => product.isActive) ?? [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Ma wishlist"
        subtitle="Les montres que vous avez sauvegardées."
        backHref="/dashboard"
      />

      {products.length === 0 ? (
        <Card className="rounded-2xl" padding="none">
          <EmptyState
            icon={<Heart className="h-7 w-7" />}
            title="Votre wishlist est vide"
            description="Ajoutez vos montres préférées pour les retrouver ici."
            action={
              <Link href="/shop" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                Découvrir la collection
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-2 xl:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
