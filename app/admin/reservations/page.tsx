import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { reviewReservationAction } from "@/actions/reservations";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Admin Reservations" };

async function reviewReservation(formData: FormData) {
  "use server";
  await reviewReservationAction(formData);
}

export default async function AdminReservationsPage() {
  await requireAdmin();
  const reservations = await db.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, user: { include: { profile: true } }, order: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-semibold text-luxury-white">Reservation review</h1>
        <p className="mt-2 text-luxury-muted">Approve or reject real reservation records. Each decision creates an audit log and customer notification.</p>
      </header>

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="rounded-2xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl text-luxury-white">{reservation.product.name}</h2>
                    <p className="mt-1 text-sm text-luxury-muted">{formatPrice(reservation.product.price)}</p>
                  </div>
                  <StatusBadge status={reservation.status} />
                </div>
                <p className="mt-3 text-sm text-luxury-muted">
                  Customer: {reservation.user.profile?.firstName} {reservation.user.profile?.lastName} / {reservation.user.email}
                </p>
                <p className="text-sm text-luxury-muted">Expires {formatDate(reservation.expiresAt)}</p>
                {reservation.notes && <p className="mt-3 rounded-xl border border-luxury-border p-3 text-sm text-luxury-muted">{reservation.notes}</p>}
              </div>
              <form action={reviewReservation} className="space-y-3">
                <input type="hidden" name="reservationId" value={reservation.id} />
                <select name="status" className="input-luxury w-full" defaultValue="APPROVED">
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
                <textarea name="adminNotes" className="input-luxury min-h-24 w-full" placeholder="Admin note to customer" />
                <SubmitButton>Submit review</SubmitButton>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
