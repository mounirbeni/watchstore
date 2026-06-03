"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function createPromoCodeAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const description = String(formData.get("description") ?? "").trim() || null;
  const discountType = String(formData.get("discountType") ?? "PERCENT");
  const discountValue = Number(formData.get("discountValue"));
  const minOrderAmount = formData.get("minOrderAmount") ? Number(formData.get("minOrderAmount")) : null;
  const maxUses = formData.get("maxUses") ? Number(formData.get("maxUses")) : null;
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!code || code.length < 3) return { success: false, error: "Code invalide (3 caractères minimum)" };
  if (!/^[A-Z0-9_-]+$/.test(code)) return { success: false, error: "Code invalide : lettres, chiffres, - et _ uniquement" };
  if (!["PERCENT", "FIXED"].includes(discountType)) return { success: false, error: "Type de remise invalide" };
  if (isNaN(discountValue) || discountValue <= 0) return { success: false, error: "Valeur de remise invalide" };
  if (discountType === "PERCENT" && discountValue > 100) return { success: false, error: "Pourcentage max 100%" };

  try {
    await db.promoCode.create({
      data: { code, description, discountType, discountValue, minOrderAmount, maxUses, expiresAt },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") return { success: false, error: "Ce code existe déjà" };
    return { success: false, error: "Erreur lors de la création" };
  }

  revalidatePath("/admin/promos");
  return { success: true, data: undefined };
}

export async function togglePromoCodeAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const id = String(formData.get("id") ?? "");
  const promo = await db.promoCode.findUnique({ where: { id } });
  if (!promo) return { success: false, error: "Code introuvable" };

  await db.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath("/admin/promos");
  return { success: true, data: undefined };
}

export async function deletePromoCodeAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const id = String(formData.get("id") ?? "");
  await db.promoCode.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/promos");
  return { success: true, data: undefined };
}
