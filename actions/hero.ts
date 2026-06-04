"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

function slideFromForm(formData: FormData) {
  return {
    image:          String(formData.get("image") ?? "").trim(),
    eyebrow:        String(formData.get("eyebrow") ?? "").trim(),
    titleTop:       String(formData.get("titleTop") ?? "").trim(),
    titleAccent:    String(formData.get("titleAccent") ?? "").trim(),
    description:    String(formData.get("description") ?? "").trim(),
    primaryLabel:   String(formData.get("primaryLabel") ?? "Explorer").trim(),
    primaryHref:    String(formData.get("primaryHref") ?? "/shop").trim(),
    secondaryLabel: String(formData.get("secondaryLabel") ?? "Voir tout").trim(),
    secondaryHref:  String(formData.get("secondaryHref") ?? "/shop").trim(),
    sortOrder:      parseInt(String(formData.get("sortOrder") ?? "0"), 10),
    isActive:       formData.get("isActive") === "true",
  };
}

export async function createHeroSlideAction(formData: FormData) {
  await requireAdmin();
  const data = slideFromForm(formData);
  if (!data.image) return { success: false, error: "L'image est obligatoire." };
  await db.heroSlide.create({ data });
  revalidatePath("/");
  return { success: true };
}

export async function updateHeroSlideAction(id: string, formData: FormData) {
  await requireAdmin();
  const data = slideFromForm(formData);
  if (!data.image) return { success: false, error: "L'image est obligatoire." };
  await db.heroSlide.update({ where: { id }, data });
  revalidatePath("/");
  return { success: true };
}

export async function deleteHeroSlideAction(id: string) {
  await requireAdmin();
  await db.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

export async function toggleHeroSlideAction(id: string, isActive: boolean) {
  await requireAdmin();
  await db.heroSlide.update({ where: { id }, data: { isActive } });
  revalidatePath("/");
  return { success: true };
}
