import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/utils";
import { calculateCustomerRisk, riskBadgeClass } from "@/lib/admin-risk";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Commandes" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function ordersHref(next: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value));
  }
  const query = params.toString();
  return `/admin/orders${query ? `?${query}` : ""}`;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const q = param(params.q).trim();
  const status = param(params.status);
  const paymentStatus = param(params.payment);
  const from = param(params.from);
  const to = param(params.to);
  const page = Math.max(1, Number.parseInt(param(params.page), 10) || 1);

  const createdAt: Prisma.DateTimeFilter = {};
  if (from) createdAt.gte = new Date(`${from}T00:00:00`);
  if (to) createdAt.lte = new Date(`${to}T23:59:59`);

  const where: Prisma.OrderWhereInput = {
    ...(status && status !== "all" ? { status: status as OrderStatus } : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
    ...(paymentStatus && paymentStatus !== "all" ? { payment: { status: paymentStatus as PaymentStatus } } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customerPhone: { contains: q, mode: "insensitive" } },
            { trackingNumber: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { user: { profile: { firstName: { contains: q, mode: "insensitive" } } } },
            { user: { profile: { lastName: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const [totalOrders, orders, statusCounts, paymentCounts] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: [{ flagged: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: {
          include: {
            profile: true,
            orders: {
              include: { payment: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        payment: true,
        items: true,
        address: true,
      },
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.payment.groupBy({ by: ["status"], _count: true }),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Operations</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Order management center</h1>
          <p className="mt-2 max-w-2xl text-luxury-muted">
            Search, filter, review payments, inspect customers, and control fulfilment from live order records.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Filtered orders</p>
            <p className="mt-1 text-xl font-semibold text-white">{totalOrders}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Page value</p>
            <p className="mt-1 text-xl font-semibold text-white">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Need deposit</p>
            <p className="mt-1 text-xl font-semibold text-white">{statusCounts.find((s) => s.status === OrderStatus.DEPOSIT_PENDING)?._count ?? 0}</p>
          </div>
        </div>
      </header>

      <Card className="rounded-2xl">
        <form action="/admin/orders" className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_150px_150px_auto_auto]">
          <input name="q" defaultValue={q} className="input-luxury" placeholder="Order, email, phone, tracking" />
          <select name="status" defaultValue={status || "all"} className="input-luxury">
            <option value="all">All order statuses</option>
            {Object.values(OrderStatus).map((value) => (
              <option key={value} value={value}>{value} ({statusCounts.find((s) => s.status === value)?._count ?? 0})</option>
            ))}
          </select>
          <select name="payment" defaultValue={paymentStatus || "all"} className="input-luxury">
            <option value="all">All payments</option>
            {Object.values(PaymentStatus).map((value) => (
              <option key={value} value={value}>{value} ({paymentCounts.find((p) => p.status === value)?._count ?? 0})</option>
            ))}
          </select>
          <input type="date" name="from" defaultValue={from} className="input-luxury" />
          <input type="date" name="to" defaultValue={to} className="input-luxury" />
          <button className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gold-400">Filter</button>
          <Link href="/admin/orders" className="inline-flex items-center justify-center rounded-lg border border-luxury-border px-5 py-2.5 text-sm font-medium text-luxury-muted transition hover:text-white">
            Reset
          </Link>
        </form>
      </Card>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card className="rounded-2xl">
            <p className="text-sm text-luxury-muted">No orders match these filters.</p>
          </Card>
        ) : orders.map((order) => {
          const risk = calculateCustomerRisk(order.user.orders);
          return (
            <Card key={order.id} className="rounded-2xl">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.8fr_0.7fr_auto] xl:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-white hover:text-gold-300">
                      {order.orderNumber}
                    </Link>
                    <StatusBadge status={order.status} />
                    {order.payment && <StatusBadge status={order.payment.status} />}
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${riskBadgeClass(risk.level)}`}>
                      {risk.level} risk
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-luxury-light">
                    {order.user.profile?.firstName ?? ""} {order.user.profile?.lastName ?? ""} / {order.user.email}
                  </p>
                  <p className="mt-1 text-xs text-luxury-muted">
                    {formatDate(order.createdAt)} / {order.customerPhone ?? order.address?.phone ?? "No phone"} / {order.address?.city ?? "No city"}
                  </p>
                </div>
                <div className="text-sm text-luxury-muted">
                  <p>Items: <span className="text-luxury-light">{order.items.length}</span></p>
                  <p>Tracking: <span className="text-luxury-light">{order.trackingNumber ?? "Not assigned"}</span></p>
                  <p>Risk reasons: <span className="text-luxury-light">{risk.reasons.join(", ") || "None"}</span></p>
                </div>
                <div className="rounded-xl border border-luxury-border bg-luxury-dark/50 p-3 text-sm">
                  <div className="flex justify-between gap-6"><span className="text-luxury-muted">Total</span><span className="text-white">{formatPrice(order.total)}</span></div>
                  <div className="flex justify-between gap-6"><span className="text-luxury-muted">Deposit</span><span className="text-gold-400">{formatPrice(order.depositAmount)}</span></div>
                  <div className="flex justify-between gap-6"><span className="text-luxury-muted">Remaining</span><span className="text-white">{formatPrice(order.remainingBalance)}</span></div>
                </div>
                <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center justify-center rounded-xl border border-gold-500/40 px-4 py-2 text-sm font-semibold text-gold-400 transition hover:bg-gold-500/10">
                  Details
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm text-luxury-muted">
        <span>Page {Math.min(page, pageCount)} of {pageCount}</span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={ordersHref({ q, status, payment: paymentStatus, from, to, page: page - 1 })} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-white">Previous</Link>
          ) : <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Previous</span>}
          {page < pageCount ? (
            <Link href={ordersHref({ q, status, payment: paymentStatus, from, to, page: page + 1 })} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-white">Next</Link>
          ) : <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Next</span>}
        </div>
      </div>
    </div>
  );
}
