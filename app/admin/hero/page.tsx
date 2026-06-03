import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createHeroSlideAction, deleteHeroSlideAction, toggleHeroSlideAction } from "@/actions/hero";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { isCloudinaryConfigured } from "@/lib/product-image-storage";
import { ImageIcon, Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export const metadata = { title: "Slides Hero" };

async function createSlide(formData: FormData) {
  "use server";
  await createHeroSlideAction(formData);
  redirect("/admin/hero");
}

async function deleteSlide(id: string) {
  "use server";
  await deleteHeroSlideAction(id);
  redirect("/admin/hero");
}

async function toggleSlide(id: string, isActive: boolean) {
  "use server";
  await toggleHeroSlideAction(id, isActive);
  redirect("/admin/hero");
}

export default async function AdminHeroPage() {
  await requireAdmin();
  const cloudinaryConfigured = isCloudinaryConfigured();
  const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Slides Hero</h1>
        <p className="mt-1 text-luxury-muted text-sm">Gérez les slides du carousel principal de la page d&apos;accueil.</p>
      </header>

      {/* Slides list */}
      {slides.length === 0 ? (
        <p className="text-sm text-luxury-muted">Aucune slide. Créez-en une ci-dessous.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div key={slide.id} className="overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark/50">
              <div className="relative aspect-video bg-luxury-dark overflow-hidden">
                {slide.image ? (
                  <Image src={slide.image} alt={slide.eyebrow || "Slide"} fill className="object-cover" sizes="33vw" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-8 w-8 text-luxury-muted" /></div>
                )}
                {!slide.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-xs font-semibold text-luxury-muted bg-black/60 px-3 py-1 rounded-full">Masqué</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  {slide.eyebrow && <p className="text-[10px] text-gold-400 font-semibold uppercase tracking-widest">{slide.eyebrow}</p>}
                  <p className="text-white text-sm font-serif">{slide.titleTop} <span className="text-gold-400">{slide.titleAccent}</span></p>
                </div>
                <span className="absolute top-2 right-2 bg-black/60 text-luxury-muted text-[10px] px-2 py-0.5 rounded-full">#{slide.sortOrder}</span>
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/hero/${slide.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-luxury-border text-luxury-muted text-xs font-medium hover:text-luxury-white transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Modifier
                </Link>
                <div className="flex gap-2">
                  <form action={toggleSlide.bind(null, slide.id, !slide.isActive)}>
                    <button type="submit" className="p-1.5 rounded-lg border border-luxury-border text-luxury-muted hover:text-luxury-white transition-colors" title={slide.isActive ? "Masquer" : "Afficher"}>
                      {slide.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </form>
                  <form action={deleteSlide.bind(null, slide.id)}>
                    <button type="submit" className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" title="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create new slide */}
      <Card className="rounded-2xl">
        <h2 className="text-lg font-serif font-semibold text-luxury-white mb-5 flex items-center gap-2">
          <Plus className="h-4 w-4 text-gold-400" /> Nouvelle slide
        </h2>
        <form action={createSlide} className="grid gap-5">
          <div className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Image de fond *</span>
            <SingleImageUploader name="image" cloudinaryConfigured={cloudinaryConfigured} label="Image du carousel (16:9 recommandé)" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Eyebrow (petit texte)</span>
              <input name="eyebrow" className="input-luxury w-full" placeholder="Ex: Collection Exclusive" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Ordre</span>
              <input name="sortOrder" type="number" defaultValue={slides.length} className="input-luxury w-full" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Titre (ligne 1)</span>
              <input name="titleTop" className="input-luxury w-full" placeholder="Ex: L'Art du" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Titre (ligne 2 — doré)</span>
              <input name="titleAccent" className="input-luxury w-full" placeholder="Ex: Temps" />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-luxury-light">Description</span>
            <input name="description" className="input-luxury w-full" placeholder="Courte phrase d'accroche…" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Bouton principal</span>
              <div className="flex gap-2">
                <input name="primaryLabel" className="input-luxury flex-1" placeholder="Label" defaultValue="Explorer" />
                <input name="primaryHref" className="input-luxury flex-1" placeholder="/shop" defaultValue="/shop" />
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-luxury-light">Bouton secondaire</span>
              <div className="flex gap-2">
                <input name="secondaryLabel" className="input-luxury flex-1" placeholder="Label" defaultValue="Voir tout" />
                <input name="secondaryHref" className="input-luxury flex-1" placeholder="/shop" defaultValue="/shop" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="hidden" name="isActive" value="false" />
            <input type="checkbox" name="isActive" value="true" defaultChecked className="rounded" />
            <span className="text-sm text-luxury-light">Visible sur la page d&apos;accueil</span>
          </label>

          <div className="border-t border-luxury-border pt-4">
            <SubmitButton>Créer la slide</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
