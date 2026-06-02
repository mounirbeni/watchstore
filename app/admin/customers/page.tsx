import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendNotificationAction, setCustomerActiveAction } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Admin Customers" };

async function sendCustomerNotification(formData: FormData) {
  "use server";
  await sendNotificationAction(formData);
}

async function setCustomerActive(userId: string, isActive: boolean) {
  "use server";
  await setCustomerActiveAction(userId, isActive);
}

export default async function AdminCustomersPage() {
  await requireAdmin();
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      orders: { include: { payment: true }, orderBy: { createdAt: "desc" } },
      reservations: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Customer management</h1>
        <p className="mt-2 text-luxury-muted">Customer profiles, history, reservation state, notifications, and suspension controls.</p>
      </header>

      <div className="grid gap-4">
        {customers.map((customer) => {
          const paidTotal = customer.orders
            .filter((order) => order.payment?.status === "PAID")
            .reduce((sum, order) => sum + Number(order.total), 0);
          return (
            <Card key={customer.id} className="rounded-2xl">
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.8fr]">
                <div>
                  <h2 className="font-serif text-xl text-white">{customer.profile?.firstName} {customer.profile?.lastName}</h2>
                  <p className="mt-1 text-sm text-luxury-muted">{customer.email}</p>
                  <p className="mt-3 text-sm text-luxury-muted">Orders: {customer.orders.length} / LTV: {formatPrice(paidTotal)}</p>
                  <p className="text-sm text-luxury-muted">Reservations: {customer.reservations.length}</p>
                  <p className="text-sm text-luxury-muted">Status: {customer.isActive ? "Active" : "Suspended"}</p>
                </div>
                <form action={sendCustomerNotification} className="space-y-3">
                  <input type="hidden" name="userId" value={customer.id} />
                  <input name="title" required className="input-luxury w-full" placeholder="Notification title" />
                  <textarea name="message" required className="input-luxury min-h-24 w-full" placeholder="Message" />
                  <SubmitButton>Send notification</SubmitButton>
                </form>
                <form action={setCustomerActive.bind(null, customer.id, !customer.isActive)} className="flex items-end">
                  <SubmitButton variant={customer.isActive ? "danger" : "gold"}>
                    {customer.isActive ? "Suspend account" : "Reactivate account"}
                  </SubmitButton>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
