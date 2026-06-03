import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateStockAction } from "@/actions/products";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Inventory" };

async function updateStock(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  await updateStockAction(productId, stock);
}

function stockAlertLabel(stock: number) {
  if (stock <= 0) return { label: "Out of stock", className: "border-gold-500/50 bg-gold-500/10 text-gold-300" };
  if (stock < 5) return { label: "Critical", className: "border-gold-500/50 bg-gold-500/10 text-gold-300" };
  if (stock < 10) return { label: "Low stock", className: "border-gold-500/30 bg-gold-500/5 text-gold-400" };
  return { label: "Healthy", className: "border-luxury-border bg-luxury-dark/50 text-luxury-muted" };
}

function stockMovementValue(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { stock?: unknown };
    return typeof parsed.stock === "number" || typeof parsed.stock === "string" ? String(parsed.stock) : null;
  } catch {
    return null;
  }
}

export default async function AdminInventoryPage() {
  await requireAdmin();

  const [products, recentMovements] = await Promise.all([
    db.product.findMany({
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      },
    }),
    db.auditLog.findMany({
      where: { entity: "Product", OR: [{ newValues: { contains: "stock" } }, { oldValues: { contains: "stock" } }] },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { include: { profile: true } } },
    }),
  ]);

  const outOfStock = products.filter((product) => product.stock <= 0).length;
  const critical = products.filter((product) => product.stock > 0 && product.stock < 5).length;
  const low = products.filter((product) => product.stock >= 5 && product.stock < 10).length;
  const healthy = products.length - outOfStock - critical - low;
  const needsAction = outOfStock + critical + low;

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-luxury-border bg-luxury-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Inventory control</p>
            <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Inventory management</h1>
            <p className="mt-2 max-w-2xl text-luxury-muted">
              Track stock health, update quantities, and review movement history from real product records.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[560px]">
            {[
              ["Total SKUs", products.length],
              ["Needs action", needsAction],
              ["Out", outOfStock],
              ["Healthy", healthy],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.14em] text-luxury-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-luxury-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden rounded-3xl" padding="none">
          <div className="flex flex-col gap-3 border-b border-luxury-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-serif text-luxury-white">Inventory ledger</h2>
              <p className="mt-1 text-sm text-luxury-muted">Sorted by lowest stock first.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-luxury-muted">
              <span className="rounded-full border border-gold-500/30 px-3 py-1">{critical} critical</span>
              <span className="rounded-full border border-gold-500/30 px-3 py-1">{low} low</span>
              <span className="rounded-full border border-luxury-border px-3 py-1">{outOfStock} out</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-luxury-dark text-xs uppercase tracking-[0.14em] text-luxury-muted">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Health</th>
                  <th className="px-5 py-4">Current</th>
                  <th className="px-5 py-4">Update stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const alert = stockAlertLabel(product.stock);
                  const image = product.images[0]?.url;
                  return (
                    <tr key={product.id} className="border-t border-luxury-border align-middle transition-colors hover:bg-luxury-border/20">
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element -- Admin thumbnails may include stored Cloudinary URLs and legacy records.
                              <img src={image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] uppercase tracking-[0.12em] text-luxury-muted">No img</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-luxury-white">{product.name}</p>
                            <p className="mt-1 text-xs text-luxury-muted">{product.sku ?? "No SKU"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-luxury-muted">{product.category?.name ?? "Uncategorized"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex min-w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${alert.className}`}>
                          {alert.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex min-w-16 items-baseline justify-center rounded-2xl border border-luxury-border bg-luxury-dark/50 px-4 py-2">
                          <span className="text-xl font-semibold text-luxury-white">{product.stock}</span>
                          <span className="ml-1 text-xs text-luxury-muted">units</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <form action={updateStock} className="flex flex-wrap items-center gap-2">
                          <input type="hidden" name="productId" value={product.id} />
                          <input
                            name="stock"
                            type="number"
                            min="0"
                            defaultValue={product.stock}
                            className="input-luxury h-10 w-24 text-center"
                          />
                          <SubmitButton>Update</SubmitButton>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex h-10 items-center rounded-lg border border-luxury-border px-3 text-xs font-semibold text-luxury-muted transition hover:text-luxury-white"
                          >
                            Edit
                          </Link>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="rounded-3xl">
            <h2 className="text-xl font-serif text-luxury-white">Stock health</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Out of stock", outOfStock],
                ["Critical under 5", critical],
                ["Low under 10", low],
                ["Healthy stock", healthy],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-luxury-border bg-luxury-dark/50 px-4 py-3">
                  <span className="text-sm text-luxury-muted">{label}</span>
                  <span className="font-semibold text-luxury-white">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl">
            <h2 className="text-xl font-serif text-luxury-white">Stock movements</h2>
            <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
              {recentMovements.length === 0 ? (
                <p className="text-sm text-luxury-muted">No stock movements yet.</p>
              ) : recentMovements.map((movement) => {
                const oldStock = stockMovementValue(movement.oldValues);
                const newStock = stockMovementValue(movement.newValues);
                return (
                  <div key={movement.id} className="rounded-2xl border border-luxury-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-luxury-white">{movement.action}</p>
                        <p className="mt-1 text-xs text-luxury-muted">{formatDate(movement.createdAt)}</p>
                      </div>
                      {(oldStock || newStock) && (
                        <span className="rounded-full border border-gold-500/30 px-2.5 py-1 text-xs text-gold-400">
                          {oldStock ?? "-"} to {newStock ?? "-"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-luxury-muted">
                      By {movement.user?.profile ? `${movement.user.profile.firstName} ${movement.user.profile.lastName}` : movement.user?.email ?? "System"}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
