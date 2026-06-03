import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { updateHeroSlideAction } from "@/actions/hero";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";

interface Props { params: Promise<{ slideId: string }> }

async function save(id: string, formData: FormData) {
  "use server";
  await updateHeroSlideAction(id, formData);
  redirect("/admin/hero");
}

export default async function AdminHeroEditPage({ params }: Props) {
  await requireAdmin();
  const { slideId } = await params;
  const cloudinaryConfigured = isCloudinaryConfigured();

  const slide = await db.heroSlide.findUnique({ where: { id: slideId } });
  if (!slide) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Slides Hero</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Modifier la slide</h1>
        </div>
        <Link href="/admin/hero" className="rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted hover:text-luxury-white transition-colors">
          ← Retour
        </Link>
      </header>

      <Card className="rounded-2xl">
        <form action={save.bind(null, slide.id)} className="grid gap-6">

          <div className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Image de fond *</span>
            <p className="text-xs text-luxury-muted">Recommandé : format 16:9, au moins 1600×900 px.</p>
            <SingleImageUploader
              name="image"
              initialUrl={slide.image}
              cloudinaryConfigured={cloudinaryConfigured}
              label="Glissez l'image ici ou cliquez pour choisir"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Eyebrow (petit texte doré)</span>
              <input name="eyebrow" defaultValue={slide.eyebrow} className="input-luxury w-full" placeholder="Ex: Collection Exclusive" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Ordre d&apos;affichage</span>
              <input name="sortOrder" type="number" min="0" defaultValue={slide.sortOrder} className="input-luxury w-full" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Titre — ligne 1</span>
              <input name="titleTop" defaultValue={slide.titleTop} className="input-luxury w-full" placeholder="Ex: L'Art du" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Titre — ligne 2 (doré)</span>
              <input name="titleAccent" defaultValue={slide.titleAccent} className="input-luxury w-full" placeholder="Ex: Temps" />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Description</span>
            <input name="description" defaultValue={slide.description} className="input-luxury w-full" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Bouton principal</span>
              <div className="flex gap-2">
                <input name="primaryLabel" defaultValue={slide.primaryLabel} className="input-luxury flex-1" placeholder="Label" />
                <input name="primaryHref" defaultValue={slide.primaryHref} className="input-luxury flex-1" placeholder="/shop" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Bouton secondaire</span>
              <div className="flex gap-2">
                <input name="secondaryLabel" defaultValue={slide.secondaryLabel} className="input-luxury flex-1" placeholder="Label" />
                <input name="secondaryHref" defaultValue={slide.secondaryHref} className="input-luxury flex-1" placeholder="/shop" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="hidden" name="isActive" value="false" />
            <input type="checkbox" name="isActive" value="true" defaultChecked={slide.isActive} className="rounded" />
            <span className="text-sm text-luxury-light">Visible sur la page d&apos;accueil</span>
          </label>

          <div className="flex gap-3 border-t border-luxury-border pt-5">
            <SubmitButton>Sauvegarder</SubmitButton>
            <Link href="/admin/hero" className="rounded-xl border border-luxury-border px-4 py-2.5 text-sm text-luxury-muted hover:text-luxury-white transition-colors">
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
