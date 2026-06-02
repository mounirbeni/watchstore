import Link from "next/link";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Reservations" };

export default async function DashboardReservationsPage() {
  const session = await requireAuth();
  const reservations = await db.reservation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } }, order: true },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Client portal</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Reservations</h1>
          <p className="mt-2 text-luxury-muted">Every reservation shown here belongs to your authenticated user id.</p>
        </div>
        <Link href="/shop" className="rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-black">Reserve a watch</Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {reservations.length === 0 ? (
          <Card className="md:col-span-2"><p className="text-sm text-luxury-muted">No reservations yet.</p></Card>
        ) : reservations.map((reservation) => {
          const image = reservation.product.images[0];
          return (
            <Card key={reservation.id} className="rounded-2xl">
              <div className="flex gap-4">
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt={image.alt ?? reservation.product.name} className="h-24 w-24 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-xl text-white">{reservation.product.name}</h2>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <p className="mt-1 text-sm text-luxury-muted">{formatPrice(reservation.product.price)} / expires {formatDate(reservation.expiresAt)}</p>
                  {reservation.adminNotes && <p className="mt-2 text-sm text-luxury-muted">Admin note: {reservation.adminNotes}</p>}
                  {reservation.order && <p className="mt-2 text-sm text-gold-400">Converted to order {reservation.order.orderNumber}</p>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
