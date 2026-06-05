import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateProductAction, deleteSingleProductAction } from "@/actions/products";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import ProductImageUploader from "../ProductImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";

export const metadata = { title: "Edit Product" };

interface Props {
  params: Promise<{ productId: string }>;
}

async function updateProduct(productId: string, formData: FormData) {
  "use server";
  const result = await updateProductAction(productId, formData);
  if (result.success) redirect("/admin/products");
}

async function deleteProduct(productId: string) {
  "use server";
  await deleteSingleProductAction(productId);
  redirect("/admin/products");
}

export default async function AdminProductEditPage({ params }: Props) {
  await requireAdmin();
  const { productId } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id: productId },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  const cloudinaryConfigured = isCloudinaryConfigured();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Edit product</h1>
          <p className="mt-2 text-luxury-muted">Modify product details, pricing, inventory, category, visibility, and gallery images.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted transition hover:text-luxury-white">
            Back
          </Link>
          <Link href={`/products/${product.slug}`} className="rounded-xl border border-gold-500/40 px-4 py-2 text-sm text-gold-400 transition hover:bg-gold-500/10">
            View product
          </Link>
          <form action={deleteProduct.bind(null, product.id)}>
            <button
              type="submit"
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10"
            >
              Delete product
            </button>
          </form>
        </div>
      </header>

      <Card className="rounded-2xl">
        <form action={updateProduct.bind(null, product.id)} className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Watch name</span>
              <input name="name" required defaultValue={product.name} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">SKU</span>
              <input name="sku" defaultValue={product.sku ?? ""} className="input-luxury w-full" />
            </label>
          </section>

          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Description</span>
            <textarea name="description" required defaultValue={product.description} className="input-luxury min-h-36 w-full" />
          </label>

          <section className="grid gap-4 md:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Price</span>
              <input name="price" required type="number" min="1" step="0.01" defaultValue={product.price.toString()} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Compare price</span>
              <input name="comparePrice" type="number" min="1" step="0.01" defaultValue={product.comparePrice?.toString() ?? ""} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Stock</span>
              <input name="stock" required type="number" min="0" defaultValue={product.stock} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Low stock at</span>
              <input name="lowStockAt" required type="number" min="0" defaultValue={product.lowStockAt} className="input-luxury w-full" />
            </label>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Category</span>
              <select name="categoryId" defaultValue={product.categoryId ?? ""} className="input-luxury w-full">
                <option value="">No category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Brand</span>
              <input name="brand" defaultValue={product.brand ?? ""} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Movement</span>
              <input name="movement" defaultValue={product.movement ?? ""} className="input-luxury w-full" />
            </label>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Case size</span>
              <input name="caseSize" defaultValue={product.caseSize ?? ""} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Case material</span>
              <input name="caseMaterial" defaultValue={product.caseMaterial ?? ""} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Water resistance</span>
              <input name="waterResist" defaultValue={product.waterResist ?? ""} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Strap material</span>
              <input name="strapMaterial" defaultValue={product.strapMaterial ?? ""} className="input-luxury w-full" />
            </label>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Badge</span>
              <input name="badge" defaultValue={product.badge ?? ""} className="input-luxury w-full" placeholder="new, hot, sale" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Featured</span>
              <select name="isFeatured" defaultValue={product.isFeatured ? "true" : "false"} className="input-luxury w-full">
                <option value="false">Not featured</option>
                <option value="true">Featured</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Status</span>
              <select name="isActive" defaultValue={product.isActive ? "true" : "false"} className="input-luxury w-full">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </section>

          {/* Social proof — admin-controlled, shown on product cards */}
          <section className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Note (étoiles)</span>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={product.rating ?? 0}
                className="input-luxury w-full"
                placeholder="ex: 4.8"
              />
              <span className="text-xs text-luxury-muted">0 à 5. Mettre 0 pour masquer les étoiles.</span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Nombre vendu</span>
              <input
                name="soldCount"
                type="number"
                min="0"
                step="1"
                defaultValue={product.soldCount ?? 0}
                className="input-luxury w-full"
                placeholder="ex: 1500"
              />
              <span className="text-xs text-luxury-muted">Affiché comme « 1.5K vendus ». 0 pour masquer.</span>
            </label>
          </section>

          <ProductImageUploader
            cloudinaryConfigured={cloudinaryConfigured}
            initialImages={product.images.map((image) => ({
              id: image.id,
              url: image.url,
              publicId: image.publicId,
              altText: image.altText ?? image.alt,
              isPrimary: image.isPrimary,
              sortOrder: image.sortOrder,
            }))}
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-luxury-border pt-5">
            <SubmitButton>Save product changes</SubmitButton>
            <Link href="/admin/products" className="rounded-xl border border-luxury-border px-4 py-2.5 text-sm text-luxury-muted transition hover:text-luxury-white">
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
