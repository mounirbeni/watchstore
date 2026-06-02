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
  if (stock <= 0) return { label: "Out of stock", className: "border-red-500/40 bg-red-500/10 text-red-300" };
  if (stock < 5) return { label: "Critical < 5", className: "border-red-500/40 bg-red-500/10 text-red-300" };
  if (stock < 10) return { label: "Low < 10", className: "border-gold-500/40 bg-gold-500/10 text-gold-300" };
  return { label: "Healthy", className: "border-luxury-border text-luxury-muted" };
}

export default async function AdminInventoryPage() {
  await requireAdmin();

  const [products, recentMovements] = await Promise.all([
    db.product.findMany({
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      include: { category: true, images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 } },
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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Inventory control</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Inventory management</h1>
          <p className="mt-2 max-w-2xl text-luxury-muted">
            Track stock levels, update inventory, and review stock movement audit history.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Out</p>
            <p className="mt-1 text-xl font-semibold text-white">{outOfStock}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Critical</p>
            <p className="mt-1 text-xl font-semibold text-white">{critical}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Low</p>
            <p className="mt-1 text-xl font-semibold text-white">{low}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden rounded-2xl" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
                <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Alert</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Action</th></tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const alert = stockAlertLabel(product.stock);
                  return (
                    <tr key={product.id} className="border-t border-luxury-border">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-luxury-muted">{product.sku ?? "No SKU"}</p>
                      </td>
                      <td className="px-5 py-4 text-luxury-muted">{product.category?.name ?? "Uncategorized"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs ${alert.className}`}>{alert.label}</span>
                      </td>
                      <td className="px-5 py-4 text-white">{product.stock}</td>
                      <td className="px-5 py-4">
                        <form action={updateStock} className="flex gap-2">
                          <input type="hidden" name="productId" value={product.id} />
                          <input name="stock" type="number" min="0" defaultValue={product.stock} className="input-luxury w-24" />
                          <SubmitButton>Update</SubmitButton>
                          <Link href={`/admin/products/${product.id}`} className="rounded-xl border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-white">
                            Edit product
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

        <Card className="rounded-2xl">
          <h2 className="text-xl font-serif text-white">Stock movements</h2>
          <div className="mt-4 space-y-3">
            {recentMovements.length === 0 ? <p className="text-sm text-luxury-muted">No stock movements yet.</p> : recentMovements.map((movement) => (
              <div key={movement.id} className="rounded-xl border border-luxury-border p-4">
                <p className="font-medium text-white">{movement.action}</p>
                <p className="mt-1 text-sm text-luxury-muted">{formatDate(movement.createdAt)}</p>
                <p className="mt-1 text-xs text-luxury-muted">
                  By {movement.user?.profile ? `${movement.user.profile.firstName} ${movement.user.profile.lastName}` : movement.user?.email ?? "System"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
