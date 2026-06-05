"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { ProductSchema } from "@/validations";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { deleteProductImage } from "@/lib/product-image-storage";
import type { ActionResult } from "./auth";

interface ProductImagePayload {
  id?: string;
  url: string;
  publicId?: string | null;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

function parseProductImages(formData: FormData): ProductImagePayload[] {
  const raw = String(formData.get("productImages") ?? "[]");
  const parsed = JSON.parse(raw) as ProductImagePayload[];

  if (!Array.isArray(parsed)) return [];

  const images = parsed
    .filter((image) => typeof image.url === "string" && image.url.startsWith("https://"))
    .map((image, index) => ({
      id: typeof image.id === "string" ? image.id : undefined,
      url: image.url.trim(),
      publicId: typeof image.publicId === "string" && image.publicId.trim() ? image.publicId.trim() : null,
      altText: typeof image.altText === "string" && image.altText.trim() ? image.altText.trim() : null,
      isPrimary: Boolean(image.isPrimary),
      sortOrder: Number.isInteger(image.sortOrder) ? Number(image.sortOrder) : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const primaryIndex = Math.max(0, images.findIndex((image) => image.isPrimary));
  return images.map((image, index) => ({ ...image, sortOrder: index, isPrimary: index === primaryIndex }));
}

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

  let productImages: ProductImagePayload[];
  try {
    productImages = parseProductImages(formData);
  } catch {
    return { success: false, error: "Invalid product image data" };
  }

  if (productImages.length === 0) {
    return { success: false, error: "Upload at least one product image before saving." };
  }

  if (productImages.some((image) => !image.publicId)) {
    return { success: false, error: "Product images must be uploaded from the device before saving." };
  }

  const slug = slugify(parsed.data.name);

  const product = await db.product.create({
    data: {
      ...parsed.data,
      slug,
      price: parsed.data.price,
      comparePrice: parsed.data.comparePrice ?? undefined,
      images: {
        create: productImages.map((image, i) => ({
          url: image.url,
          publicId: image.publicId,
          altText: image.altText ?? parsed.data.name,
          alt: image.altText ?? parsed.data.name,
          sortOrder: i,
          isPrimary: image.isPrimary,
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

  const existing = await db.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });
  if (!existing) return { success: false, error: "Produit introuvable" };

  let productImages: ProductImagePayload[];
  try {
    productImages = parseProductImages(formData);
  } catch {
    return { success: false, error: "Invalid product image data" };
  }

  if (productImages.length === 0) {
    return { success: false, error: "Upload at least one product image before saving." };
  }

  const existingIds = new Set(existing.images.map((image) => image.id));
  if (productImages.some((image) => !image.publicId && (!image.id || !existingIds.has(image.id)))) {
    return { success: false, error: "New product images must be uploaded from the device before saving." };
  }

  const submittedPublicIds = new Set(productImages.map((image) => image.publicId).filter(Boolean));
  const removedStorageImages = existing.images.filter((image) => image.publicId && !submittedPublicIds.has(image.publicId));

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
      rating: parsed.data.rating,
      soldCount: parsed.data.soldCount,
      isFeatured: parsed.data.isFeatured,
      isActive: parsed.data.isActive,
      categoryId: parsed.data.categoryId ?? null,
      images: {
        deleteMany: {},
        create: productImages.map((image, i) => ({
          url: image.url,
          publicId: image.publicId ?? null,
          altText: image.altText ?? parsed.data.name,
          alt: image.altText ?? parsed.data.name,
          sortOrder: i,
          isPrimary: image.isPrimary,
        })),
      },
    },
  });

  for (const image of removedStorageImages) {
    if (image.publicId) await deleteProductImage(image.publicId);
  }

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

export async function deleteSingleProductAction(productId: string): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true },
  });
  if (!product) return { success: false, error: "Produit introuvable" };

  const hasOrders = await db.orderItem.findFirst({ where: { productId } });

  // Clean cart / wishlist references regardless
  await db.cartItem.deleteMany({ where: { productId } });
  await db.wishlistItem.deleteMany({ where: { productId } });

  if (hasOrders) {
    // FK constraint — can't hard-delete; hide instead
    await db.product.update({
      where: { id: productId },
      data: { isActive: false, stock: 0 },
    });
  } else {
    await db.reservation.deleteMany({ where: { productId } });
    await db.productImage.deleteMany({ where: { productId } });
    await db.product.delete({ where: { id: productId } });
  }

  await createAuditLog({
    userId: admin.userId,
    action: "DELETE",
    entity: "Product",
    entityId: productId,
    oldValues: { name: product.name },
    newValues: { note: hasOrders ? "Deactivated — has order history" : "Hard deleted" },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${product.slug}`);
  return { success: true, data: undefined };
}

export async function deleteAllProductsAction(): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  // Products referenced in orders can't be hard-deleted (FK constraint).
  // Find which product IDs are safe to fully delete vs. must only be deactivated.
  const orderedItems = await db.orderItem.findMany({
    select: { productId: true },
    distinct: ["productId"],
  });
  const protectedIds = orderedItems.map((i) => i.productId);

  const deletableIds = (
    await db.product.findMany({
      where: { id: { notIn: protectedIds } },
      select: { id: true },
    })
  ).map((p) => p.id);

  // Fully delete products with no order history
  if (deletableIds.length > 0) {
    await db.cartItem.deleteMany({ where: { productId: { in: deletableIds } } });
    await db.wishlistItem.deleteMany({ where: { productId: { in: deletableIds } } });
    await db.reservation.deleteMany({ where: { productId: { in: deletableIds } } });
    await db.productImage.deleteMany({ where: { productId: { in: deletableIds } } });
    await db.product.deleteMany({ where: { id: { in: deletableIds } } });
  }

  // Products in orders: deactivate + zero stock so they're invisible, but order history is intact
  if (protectedIds.length > 0) {
    await db.cartItem.deleteMany({ where: { productId: { in: protectedIds } } });
    await db.wishlistItem.deleteMany({ where: { productId: { in: protectedIds } } });
    await db.product.updateMany({
      where: { id: { in: protectedIds } },
      data: { isActive: false, stock: 0 },
    });
  }

  await createAuditLog({
    userId: admin.userId,
    action: "DELETE",
    entity: "Product",
    entityId: "ALL",
    oldValues: {},
    newValues: {
      deleted: deletableIds.length,
      deactivated: protectedIds.length,
      note: "Bulk clear by admin",
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: true, data: undefined };
}
