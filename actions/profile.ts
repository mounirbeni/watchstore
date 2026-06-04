"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import { AddressSchema, UpdateProfileSchema } from "@/validations";
import { NotificationCategory, NotificationPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Non authentifié" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await db.customerProfile.upsert({
    where: { userId: session.userId },
    update: parsed.data,
    create: { userId: session.userId, ...parsed.data },
  });

  await createNotification({
    userId: session.userId,
    category: NotificationCategory.ACCOUNT,
    priority: NotificationPriority.STANDARD,
    title: "Profil mis à jour",
    message: "Vos informations personnelles ont été enregistrées.",
    actionUrl: "/dashboard/profile",
  });

  revalidatePath("/dashboard/profile");
  return { success: true, data: undefined };
}

export async function addAddressAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Non authentifié" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = AddressSchema.safeParse({
    ...raw,
    isDefault: raw["isDefault"] === "true",
  });
  if (!parsed.success) {
    return { success: false, error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId: session.userId },
      data: { isDefault: false },
    });
  }

  await db.address.create({
    data: { userId: session.userId, ...parsed.data },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, data: undefined };
}

export async function deleteAddressAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Non authentifié" };

  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return { success: false, error: "Adresse invalide" };

  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.userId) {
    return { success: false, error: "Adresse introuvable" };
  }

  await db.address.delete({ where: { id: addressId } });
  revalidatePath("/dashboard/profile");
  return { success: true, data: undefined };
}

export async function markNotificationReadAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Non authentifié" };

  const notificationId = String(formData.get("notificationId") ?? "");

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.userId },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
