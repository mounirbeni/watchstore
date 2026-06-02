"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function addToCartAction(productId: string): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const product = await db.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return { success: false, error: "Produit introuvable" };
  if (product.stock < 1) return { success: false, error: "Produit hors stock" };

  let cart = await db.cart.findUnique({ where: { userId: session.userId } });
  if (!cart) {
    cart = await db.cart.create({ data: { userId: session.userId } });
  }

  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: 1 } },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, quantity: 1 },
    });
  }

  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function removeFromCartAction(cartItemId: string): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const item = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== session.userId) {
    return { success: false, error: "Élément introuvable" };
  }

  await db.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function updateCartQuantityAction(
  cartItemId: string,
  quantity: number,
): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  if (quantity < 1 || quantity > 99) return { success: false, error: "Quantité invalide" };

  const item = await db.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== session.userId) {
    return { success: false, error: "Élément introuvable" };
  }

  if (quantity > item.product.stock) {
    return { success: false, error: `Stock disponible: ${item.product.stock}` };
  }

  await db.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/cart");
  return { success: true, data: undefined };
}

export async function clearCartAction(): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const cart = await db.cart.findUnique({ where: { userId: session.userId } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  revalidatePath("/cart");
  return { success: true, data: undefined };
}
