import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/ui/EmptyState";
import { CalendarClock } from "lucide-react";

export const metadata = { title: "Mes réservations" };

export default async function DashboardReservationsPage() {
  const session = await requireAuth();
  const reservations = await db.reservation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } }, order: true },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Mes réservations"
        subtitle="Vos demandes de réservation et leur statut."
        backHref="/dashboard"
        action={
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-black shadow-gold-glow-sm transition-all hover:bg-gold-400 active:scale-[0.98]"
          >
            Réserver une montre
          </Link>
        }
      />

      {reservations.length === 0 ? (
        <Card className="rounded-2xl" padding="none">
          <EmptyState
            icon={<CalendarClock className="h-7 w-7" />}
            title="Aucune réservation"
            description="Réservez une montre depuis la boutique pour la retrouver ici."
            action={
              <Link href="/shop" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
                Explorer la collection
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reservations.map((reservation) => {
            const image = reservation.product.images[0];
            return (
              <Card key={reservation.id} className="rounded-2xl">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-luxury-dark">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.alt ?? reservation.product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-serif text-lg text-white">{reservation.product.name}</h2>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <p className="mt-1 text-sm text-luxury-muted">
                      {formatPrice(reservation.product.price)} · expire le {formatDate(reservation.expiresAt)}
                    </p>
                    {reservation.adminNotes && (
                      <p className="mt-2 text-sm text-luxury-muted">Note : {reservation.adminNotes}</p>
                    )}
                    {reservation.order && (
                      <p className="mt-2 text-sm text-gold-400">Convertie en commande {reservation.order.orderNumber}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
