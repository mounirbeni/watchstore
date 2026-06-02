import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createProductAction, deleteProductAction, updateStockAction } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Admin Products" };

async function createProduct(formData: FormData) {
  "use server";
  await createProductAction(formData);
}

async function updateStock(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const stock = Number(formData.get("stock") ?? 0);
  await updateStockAction(productId, stock);
}

async function deactivateProduct(productId: string) {
  "use server";
  await deleteProductAction(productId);
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const [products, categories] = await Promise.all([
    db.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true, images: true } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Product management</h1>
        <p className="mt-2 text-luxury-muted">Create products, upload image URLs, update stock, feature products, and deactivate records.</p>
      </header>

      <Card className="rounded-2xl">
        <h2 className="mb-4 text-xl font-serif text-white">Add watch</h2>
        <form action={createProduct} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="name" required className="input-luxury" placeholder="Watch name" />
            <input name="sku" className="input-luxury" placeholder="SKU" />
          </div>
          <textarea name="description" required className="input-luxury min-h-28" placeholder="Description" />
          <div className="grid gap-4 md:grid-cols-4">
            <input name="price" required type="number" min="1" className="input-luxury" placeholder="Price" />
            <input name="comparePrice" type="number" min="1" className="input-luxury" placeholder="Compare price" />
            <input name="stock" required type="number" min="0" className="input-luxury" placeholder="Stock" />
            <input name="lowStockAt" type="number" min="0" defaultValue="5" className="input-luxury" placeholder="Low stock at" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <select name="categoryId" className="input-luxury">
              <option value="">No category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input name="brand" className="input-luxury" placeholder="Brand" />
            <input name="movement" className="input-luxury" placeholder="Movement" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input name="caseSize" className="input-luxury" placeholder="Case size" />
            <input name="caseMaterial" className="input-luxury" placeholder="Case material" />
            <input name="waterResist" className="input-luxury" placeholder="Water resistance" />
          </div>
          <input name="strapMaterial" className="input-luxury" placeholder="Strap material" />
          <input name="images" type="url" className="input-luxury" placeholder="Primary image URL" />
          <input type="hidden" name="isActive" value="true" />
          <label className="flex items-center gap-2 text-sm text-luxury-muted"><input type="checkbox" name="isFeatured" value="true" /> Featured product</label>
          <SubmitButton>Create product</SubmitButton>
        </form>
      </Card>

      <Card className="overflow-hidden rounded-2xl" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-luxury-border">
                  <td className="px-5 py-4"><p className="font-medium text-white">{product.name}</p><p className="text-xs text-luxury-muted">{product.sku ?? "No SKU"} / {product.isActive ? "Active" : "Inactive"}</p></td>
                  <td className="px-5 py-4 text-luxury-muted">{product.category?.name ?? "Uncategorized"}</td>
                  <td className="px-5 py-4">
                    <form action={updateStock} className="flex gap-2">
                      <input type="hidden" name="productId" value={product.id} />
                      <input name="stock" type="number" min="0" defaultValue={product.stock} className="input-luxury w-24" />
                      <SubmitButton>Save</SubmitButton>
                    </form>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{formatPrice(product.price)}</td>
                  <td className="px-5 py-4">
                    <form action={deactivateProduct.bind(null, product.id)}>
                      <SubmitButton variant="danger">Deactivate</SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
