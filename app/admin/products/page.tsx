import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createProductAction, setProductActiveAction, updateStockAction } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import ProductImageUploader from "./ProductImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";

export const metadata = { title: "Admin Products" };

const PAGE_SIZE = 20;

interface AdminProductsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function productListHref({
  q,
  status,
  categoryId,
  page,
}: {
  q?: string;
  status?: string;
  categoryId?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (categoryId) params.set("category", categoryId);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/products${query ? `?${query}` : ""}`;
}

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

async function updateProductStatus(formData: FormData) {
  "use server";
  const productId = String(formData.get("productId") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  await setProductActiveAction(productId, isActive);
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  await requireAdmin();
  const cloudinaryConfigured = isCloudinaryConfigured();

  const params = (await searchParams) ?? {};
  const query = firstParam(params.q).trim();
  const rawStatus = firstParam(params.status);
  const status = rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all";
  const categoryId = firstParam(params.category).trim();
  const requestedPage = Math.max(1, Number.parseInt(firstParam(params.page), 10) || 1);

  const where: Prisma.ProductWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "active" ? { isActive: true } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [totalProducts, categories, activeCount, inactiveCount, lowStockCount] = await Promise.all([
    db.product.count({ where }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: false } }),
    db.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
  ]);

  const pageCount = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, pageCount);
  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-semibold text-luxury-white">Product management</h1>
          <p className="mt-2 max-w-2xl text-luxury-muted">
            Create watches, find any catalog item quickly, update inventory, and control storefront visibility.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Active</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Inactive</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{inactiveCount}</p>
          </div>
          <div className="rounded-2xl border border-luxury-border bg-luxury-dark/60 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-luxury-muted">Low stock</p>
            <p className="mt-1 text-xl font-semibold text-luxury-white">{lowStockCount}</p>
          </div>
        </div>
      </header>

      <Card className="rounded-2xl">
        <h2 className="mb-4 text-xl font-serif text-luxury-white">Add watch</h2>
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
          <div className="grid gap-4 md:grid-cols-3">
            <input name="badge" className="input-luxury" placeholder="Badge (new, hot…)" />
            <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue="0" className="input-luxury" placeholder="Note ★ (0–5, ex 4.8)" />
            <input name="soldCount" type="number" min="0" step="1" defaultValue="0" className="input-luxury" placeholder="Nombre vendu (ex 1500)" />
          </div>
          <ProductImageUploader cloudinaryConfigured={cloudinaryConfigured} />
          <input type="hidden" name="isActive" value="true" />
          <label className="flex items-center gap-2 text-sm text-luxury-muted"><input type="checkbox" name="isFeatured" value="true" /> Featured product</label>
          <SubmitButton>Create product</SubmitButton>
        </form>
      </Card>

      <Card className="rounded-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-serif text-luxury-white">Catalog</h2>
            <p className="mt-1 text-sm text-luxury-muted">
              {totalProducts} product{totalProducts === 1 ? "" : "s"} found
            </p>
          </div>
          <form action="/admin/products" className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px_auto_auto]">
            <input name="q" defaultValue={query} className="input-luxury" placeholder="Search name, SKU, brand" />
            <select name="status" defaultValue={status} className="input-luxury">
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <select name="category" defaultValue={categoryId} className="input-luxury">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <SubmitButton>Filter</SubmitButton>
            <Link href="/admin/products" className="inline-flex items-center justify-center rounded-lg border border-luxury-border px-5 py-2.5 text-sm font-medium text-luxury-muted transition hover:text-luxury-white">
              Reset
            </Link>
          </form>
        </div>
      </Card>

      {/* Mobile — card list (tables become cards under 768px) */}
      <div className="grid gap-3 md:hidden">
        {products.length === 0 ? (
          <Card className="rounded-2xl"><p className="text-center text-sm text-luxury-muted">No products match these filters.</p></Card>
        ) : products.map((product) => {
          const primaryImage = product.images[0]?.url;
          return (
            <Card key={product.id} className="rounded-2xl" padding="none">
              <div className="flex gap-3 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-luxury-border bg-luxury-dark">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-luxury-muted">No img</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-luxury-white">{product.name}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${product.isActive ? "border-gold-500/40 text-gold-500" : "border-luxury-border text-luxury-muted"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-luxury-muted">{product.category?.name ?? "Uncategorized"} · {product.brand ?? "No brand"}</p>
                  <p className="mt-1 text-sm font-semibold text-luxury-white">{formatPrice(product.price)} · <span className="font-normal text-luxury-muted">Stock {product.stock}</span></p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-luxury-border p-3">
                <form action={updateStock} className="flex flex-1 gap-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <input name="stock" type="number" min="0" defaultValue={product.stock} className="input-luxury w-full" aria-label="Stock" />
                  <SubmitButton>Save</SubmitButton>
                </form>
                <Link href={`/admin/products/${product.id}`} className="rounded-xl border border-gold-500/40 px-3 py-2 text-xs font-semibold text-gold-500 transition hover:bg-gold-500/10">Edit</Link>
                <Link href={`/products/${product.slug}`} className="rounded-xl border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-luxury-white">View</Link>
                <form action={updateProductStatus}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="isActive" value={product.isActive ? "false" : "true"} />
                  <SubmitButton variant={product.isActive ? "danger" : "outline"}>{product.isActive ? "Off" : "On"}</SubmitButton>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop — full table */}
      <Card className="hidden overflow-hidden rounded-2xl md:block" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-luxury-muted">
                    No products match these filters.
                  </td>
                </tr>
              ) : products.map((product) => {
                const primaryImage = product.images[0]?.url;
                return (
                  <tr key={product.id} className="border-t border-luxury-border">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark">
                          {primaryImage ? (
                            // eslint-disable-next-line @next/next/no-img-element -- Admin thumbnails may include stored Cloudinary URLs and legacy records.
                            <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-luxury-muted">No img</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-luxury-white">{product.name}</p>
                          <p className="text-xs text-luxury-muted">{product.sku ?? "No SKU"} / {product.brand ?? "No brand"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-luxury-muted">{product.category?.name ?? "Uncategorized"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${product.isActive ? "border-gold-500/40 text-gold-400" : "border-luxury-border text-luxury-muted"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <form action={updateStock} className="flex gap-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <input name="stock" type="number" min="0" defaultValue={product.stock} className="input-luxury w-24" />
                        <SubmitButton>Save</SubmitButton>
                      </form>
                    </td>
                    <td className="px-5 py-4 font-medium text-luxury-white">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/products/${product.id}`} className="rounded-xl border border-gold-500/40 px-3 py-2 text-xs font-semibold text-gold-400 transition hover:bg-gold-500/10">
                          Edit
                        </Link>
                        <Link href={`/products/${product.slug}`} className="rounded-xl border border-luxury-border px-3 py-2 text-xs font-semibold text-luxury-muted transition hover:text-luxury-white">
                          View
                        </Link>
                        <form action={updateProductStatus}>
                          <input type="hidden" name="productId" value={product.id} />
                          <input type="hidden" name="isActive" value={product.isActive ? "false" : "true"} />
                          <SubmitButton variant={product.isActive ? "danger" : "outline"}>{product.isActive ? "Deactivate" : "Activate"}</SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-luxury-border px-4 py-3 text-sm text-luxury-muted sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <p>
          Page {currentPage} of {pageCount}
        </p>
        <div className="flex gap-2">
          {currentPage > 1 ? (
            <Link href={productListHref({ q: query, status, categoryId, page: currentPage - 1 })} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-luxury-white">
              Previous
            </Link>
          ) : (
            <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Previous</span>
          )}
          {currentPage < pageCount ? (
            <Link href={productListHref({ q: query, status, categoryId, page: currentPage + 1 })} className="rounded-xl border border-luxury-border px-4 py-2 transition hover:text-luxury-white">
              Next
            </Link>
          ) : (
            <span className="rounded-xl border border-luxury-border px-4 py-2 opacity-40">Next</span>
          )}
        </div>
      </div>
    </div>
  );
}
