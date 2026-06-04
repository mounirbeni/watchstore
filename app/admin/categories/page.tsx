import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createCategoryAction } from "@/actions/categories";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";
import { ImageIcon, Pencil, Plus } from "lucide-react";

export const metadata = { title: "Catégories" };

async function createCategory(formData: FormData) {
  "use server";
  const result = await createCategoryAction(formData);
  if (result.success) redirect("/admin/categories");
}

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const cloudinaryConfigured = isCloudinaryConfigured();

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-semibold text-luxury-white">Catégories</h1>
          <p className="mt-1 text-luxury-muted text-sm">Gérez les catégories et leurs images d&apos;illustration.</p>
        </div>
      </header>

      {/* List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="group relative overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark/50">
            {/* Image preview */}
            <div className="relative aspect-video bg-luxury-dark overflow-hidden">
              {cat.imageUrl ? (
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="33vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-luxury-muted" />
                </div>
              )}
              {!cat.isActive && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-luxury-muted text-[10px] font-semibold">Inactif</span>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-luxury-white text-sm">{cat.name}</p>
                <p className="text-xs text-luxury-muted mt-0.5">{cat._count.products} produit{cat._count.products !== 1 ? "s" : ""} · /{cat.slug}</p>
              </div>
              <Link
                href={`/admin/categories/${cat.id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-luxury-border text-luxury-muted text-xs font-medium hover:text-luxury-white hover:border-gold-500/50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create new category */}
      <Card className="rounded-2xl">
        <h2 className="text-lg font-serif font-semibold text-luxury-white mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-gold-400" /> Nouvelle catégorie
        </h2>
        <form action={createCategory} className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Nom *</span>
              <input name="name" required className="input-luxury w-full" placeholder="Ex: Sport" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Slug * (URL)</span>
              <input name="slug" required className="input-luxury w-full" placeholder="Ex: sport" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Description</span>
            <input name="description" className="input-luxury w-full" placeholder="Brève description…" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Ordre d&apos;affichage</span>
            <input name="sortOrder" type="number" defaultValue={categories.length} className="input-luxury w-32" />
          </label>
          <div className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Image de la catégorie</span>
            <SingleImageUploader name="imageUrl" cloudinaryConfigured={cloudinaryConfigured} label="Glissez une image ici" />
          </div>
          <div className="border-t border-luxury-border pt-4">
            <SubmitButton>Créer la catégorie</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
