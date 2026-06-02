"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { ProductSchema } from "@/validations";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "./auth";

export async function createProductAction(formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductSchema.safeParse({
    ...raw,
    isFeatured: raw["isFeatured"] === "true",
    isActive: raw["isActive"] !== "false",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const slug = slugify(parsed.data.name);
  const imageUrls = (formData.getAll("images") as string[])
    .map((url) => url.trim())
    .filter(Boolean);

  const product = await db.product.create({
    data: {
      ...parsed.data,
      slug,
      price: parsed.data.price,
      comparePrice: parsed.data.comparePrice ?? undefined,
      images: {
        create: imageUrls.map((url, i) => ({
          url,
          alt: parsed.data.name,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      },
    },
  });

  await createAuditLog({
    userId: admin.userId,
    action: "CREATE",
    entity: "Product",
    entityId: product.id,
    newValues: { name: product.name, price: product.price.toString() },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, data: { slug: product.slug } };
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = ProductSchema.safeParse({
    ...raw,
    isFeatured: raw["isFeatured"] === "true",
    isActive: raw["isActive"] !== "false",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const existing = await db.product.findUnique({ where: { id: productId } });
  if (!existing) return { success: false, error: "Produit introuvable" };

  const imageUrls = (formData.getAll("images") as string[])
    .map((url) => url.trim())
    .filter(Boolean);
  const replaceImages = formData.get("replaceImages") === "true";

  await db.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      comparePrice: parsed.data.comparePrice ?? null,
      sku: parsed.data.sku ?? null,
      stock: parsed.data.stock,
      lowStockAt: parsed.data.lowStockAt,
      brand: parsed.data.brand ?? null,
      movement: parsed.data.movement ?? null,
      caseSize: parsed.data.caseSize ?? null,
      caseMaterial: parsed.data.caseMaterial ?? null,
      waterResist: parsed.data.waterResist ?? null,
      strapMaterial: parsed.data.strapMaterial ?? null,
      badge: parsed.data.badge ?? null,
      isFeatured: parsed.data.isFeatured,
      isActive: parsed.data.isActive,
      categoryId: parsed.data.categoryId ?? null,
      ...(replaceImages
        ? {
            images: {
              deleteMany: {},
              create: imageUrls.map((url, i) => ({
                url,
                alt: parsed.data.name,
                sortOrder: i,
                isPrimary: i === 0,
              })),
            },
          }
        : {}),
    },
  });

  await createAuditLog({
    userId: admin.userId,
    action: "UPDATE",
    entity: "Product",
    entityId: productId,
    oldValues: { name: existing.name, price: existing.price.toString() },
    newValues: { name: parsed.data.name, price: String(parsed.data.price) },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${existing.slug}`);
  return { success: true, data: undefined };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  return setProductActiveAction(productId, false);
}

export async function setProductActiveAction(productId: string, isActive: boolean): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: "Produit introuvable" };

  await db.product.update({
    where: { id: productId },
    data: { isActive },
  });

  await createAuditLog({
    userId: admin.userId,
    action: "UPDATE",
    entity: "Product",
    entityId: productId,
    oldValues: { name: product.name, isActive: product.isActive },
    newValues: { name: product.name, isActive },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/products/${product.slug}`);
  return { success: true, data: undefined };
}

export async function updateStockAction(
  productId: string,
  stock: number,
): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  if (stock < 0) return { success: false, error: "Stock invalide" };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, stock: true },
  });
  if (!product) return { success: false, error: "Produit introuvable" };

  await db.product.update({ where: { id: productId }, data: { stock } });

  await createAuditLog({
    userId: admin.userId,
    action: "UPDATE",
    entity: "Product",
    entityId: productId,
    oldValues: { name: product.name, stock: product.stock },
    newValues: { name: product.name, stock },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath(`/products/${product.slug}`);
  return { success: true, data: undefined };
}
