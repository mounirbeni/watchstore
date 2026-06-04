"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function toggleWishlistAction(productId: string): Promise<ActionResult<{ added: boolean }>> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  let wishlist = await db.wishlist.findUnique({ where: { userId: session.userId } });
  if (!wishlist) {
    wishlist = await db.wishlist.create({ data: { userId: session.userId } });
  }

  const existing = await db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/wishlist");
    return { success: true, data: { added: false } };
  }

  await db.wishlistItem.create({
    data: { wishlistId: wishlist.id, productId },
  });

  revalidatePath("/dashboard/wishlist");
  return { success: true, data: { added: true } };
}
