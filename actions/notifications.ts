"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

function revalidate() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/admin/notifications");
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  await db.notification.updateMany({
    where: { id, userId: session.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  revalidate();
  return { success: true, data: undefined };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  await db.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  revalidate();
  return { success: true, data: undefined };
}

export async function deleteNotificationAction(id: string): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  await db.notification.deleteMany({ where: { id, userId: session.userId } });
  revalidate();
  return { success: true, data: undefined };
}

export async function clearAllNotificationsAction(): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  await db.notification.deleteMany({ where: { userId: session.userId } });
  revalidate();
  return { success: true, data: undefined };
}
