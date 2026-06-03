import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateCategoryAction } from "@/actions/categories";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";

interface Props { params: Promise<{ categoryId: string }> }

async function save(id: string, formData: FormData) {
  "use server";
  await updateCategoryAction(id, formData);
  redirect("/admin/categories");
}

export default async function AdminCategoryEditPage({ params }: Props) {
  await requireAdmin();
  const { categoryId } = await params;
  const cloudinaryConfigured = isCloudinaryConfigured();

  const category = await db.category.findUnique({ where: { id: categoryId } });
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Catégories</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Modifier — {category.name}</h1>
        </div>
        <Link href="/admin/categories" className="rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted hover:text-luxury-white transition-colors">
          ← Retour
        </Link>
      </header>

      <Card className="rounded-2xl">
        <form action={save.bind(null, category.id)} className="grid gap-6">

          {/* Image — top and large */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Image de la catégorie</span>
            <p className="text-xs text-luxury-muted">Utilisée dans les cartes de catégorie et la bannière de collection.</p>
            <SingleImageUploader
              name="imageUrl"
              initialUrl={category.imageUrl ?? ""}
              cloudinaryConfigured={cloudinaryConfigured}
              label="Glissez l'image ici ou cliquez pour choisir"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Nom *</span>
              <input name="name" required defaultValue={category.name} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Slug (URL)</span>
              <input value={category.slug} disabled className="input-luxury w-full opacity-50 cursor-not-allowed" />
              <p className="text-[10px] text-luxury-muted">Le slug ne peut pas être modifié.</p>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Description</span>
            <input name="description" defaultValue={category.description ?? ""} className="input-luxury w-full" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Ordre d&apos;affichage</span>
              <input name="sortOrder" type="number" min="0" defaultValue={category.sortOrder} className="input-luxury w-full" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Statut</span>
              <select name="isActive" defaultValue={category.isActive ? "true" : "false"} className="input-luxury w-full">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3 border-t border-luxury-border pt-5">
            <SubmitButton>Sauvegarder</SubmitButton>
            <Link href="/admin/categories" className="rounded-xl border border-luxury-border px-4 py-2.5 text-sm text-luxury-muted hover:text-luxury-white transition-colors">
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
