import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { sendNotificationAction, setCustomerActiveAction } from "@/actions/admin";
import { calculateCustomerRisk, riskBadgeClass } from "@/lib/admin-risk";
import { formatDate, formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Admin Customers" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

async function sendCustomerNotification(formData: FormData) {
  "use server";
  await sendNotificationAction(formData);
}

async function setCustomerActive(userId: string, isActive: boolean) {
  "use server";
  await setCustomerActiveAction(userId, isActive);
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const q = param(params.q).trim();
  const status = param(params.status) || "all";
  const page = Math.max(1, Number.parseInt(param(params.page), 10) || 1);

  const where: Prisma.UserWhereInput = {
    role: "CUSTOMER",
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "suspended" ? { isActive: false } : {}),
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { profile: { firstName: { contains: q, mode: "insensitive" } } },
            { profile: { lastName: { contains: q, mode: "insensitive" } } },
            { profile: { phone: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [totalCustomers, customers, activeCustomers, suspendedCustomers] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        profile: true,
        orders: { include: { payment: true }, orderBy: { createdAt: "desc" } },
        reservations: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    db.user.count({ where: { role: "CUSTOMER", isActive: false } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Customer operations</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Customer management</h1>
          <p className="mt-2 max-w-2xl text-luxury-muted">
            Search customers, review spend and risk, notify clients, and suspend or reactivate accounts.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Filtered</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{totalCustomers}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Active</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{activeCustomers}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Suspended</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{suspendedCustomers}</p>
          </div>
        </div>
      </header>

      <Card className="rounded-2xl">
        <form action="/admin/customers" className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_auto_auto]">
          <input name="q" defaultValue={q} className="input-luxury" placeholder="Search email, name, phone" />
          <select name="status" defaultValue={status} className="input-luxury">
            <option value="all">All accounts</option>
            <option value="active">Active only</option>
            <option value="suspended">Suspended only</option>
          </select>
          <button className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gold-400">Filter</button>
          <Link href="/admin/customers" className="inline-flex items-center justify-center rounded-lg border border-luxury-border px-5 py-2.5 text-sm font-medium text-luxury-muted transition hover:text-luxury-white">
            Reset
          </Link>
        </form>
      </Card>

      <div className="grid gap-4">
        {customers.length === 0 ? (
          <Card className="rounded-2xl"><p className="text-sm text-luxury-muted">No customers match these filters.</p></Card>
        ) : customers.map((customer) => {
          const paidTotal = customer.orders
            .filter((order) => order.payment?.status === "DEPOSIT_PAID" || order.payment?.status === "PAID")
            .reduce((sum, order) => sum + Number(order.total), 0);
          const cancellations = customer.orders.filter((order) => order.status === "CANCELLED").length;
          const risk = calculateCustomerRisk(customer.orders);

          return (
            <Card key={customer.id} className="rounded-2xl">
              <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr_1fr_auto] xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/customers/${customer.id}`} className="font-serif text-xl text-luxury-white hover:text-gold-300">
                      {customer.profile?.firstName ?? "No"} {customer.profile?.lastName ?? "Name"}
                    </Link>
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${riskBadgeClass(risk.level)}`}>
                      {risk.level} risk
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-luxury-muted">{customer.email}</p>
                  <p className="mt-1 text-sm text-luxury-muted">{customer.profile?.phone ?? "No phone"} / joined {formatDate(customer.createdAt)}</p>
                  <p className="mt-2 text-sm text-luxury-muted">Status: {customer.isActive ? "Active" : "Suspended"}</p>
                </div>
                <div className="text-sm text-luxury-muted">
                  <p>Orders: <span className="text-luxury-light">{customer.orders.length}</span></p>
                  <p>Total spend: <span className="text-luxury-white">{formatPrice(paidTotal)}</span></p>
                  <p>Cancellations: <span className="text-luxury-light">{cancellations}</span></p>
                  <p>Reservations: <span className="text-luxury-light">{customer.reservations.length}</span></p>
                </div>
                <form action={sendCustomerNotification} className="grid gap-2">
                  <input type="hidden" name="userId" value={customer.id} />
                  <input name="title" required className="input-luxury w-full" placeholder="Notification title" />
                  <textarea name="message" required className="input-luxury min-h-20 w-full" placeholder="Message" />
                  <SubmitButton>Send notification</SubmitButton>
                </form>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Link href={`/admin/customers/${customer.id}`} className="rounded-xl border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 transition hover:bg-gold-500/10">
                    Details
                  </Link>
                  <form action={setCustomerActive.bind(null, customer.id, !customer.isActive)}>
                    <SubmitButton variant={customer.isActive ? "danger" : "gold"}>
                      {customer.isActive ? "Suspend" : "Reactivate"}
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-luxury-muted">
        <span>Page {Math.min(page, pageCount)} of {pageCount}</span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={`/admin/customers?q=${encodeURIComponent(q)}&status=${status}&page=${page - 1}`} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-luxury-white">Previous</Link>
          ) : <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Previous</span>}
          {page < pageCount ? (
            <Link href={`/admin/customers?q=${encodeURIComponent(q)}&status=${status}&page=${page + 1}`} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-luxury-white">Next</Link>
          ) : <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Next</span>}
        </div>
      </div>
    </div>
  );
}
