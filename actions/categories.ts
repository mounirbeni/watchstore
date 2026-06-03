"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  const name      = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl  = String(formData.get("imageUrl") ?? "").trim() || null;
  const isActive  = formData.get("isActive") === "true";
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);

  if (!name) return { success: false, error: "Le nom est obligatoire." };

  await db.category.update({
    where: { id },
    data: { name, description, imageUrl, isActive, sortOrder },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name      = String(formData.get("name") ?? "").trim();
  const slug      = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl  = String(formData.get("imageUrl") ?? "").trim() || null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);

  if (!name || !slug) return { success: false, error: "Nom et slug sont obligatoires." };

  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "Un slug identique existe déjà." };

  await db.category.create({ data: { name, slug, description, imageUrl, sortOrder } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}
