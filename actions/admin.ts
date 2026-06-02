"use server";

import { db } from "@/lib/db";
import { createAuditLog, notifyUser } from "@/lib/audit";
import { requireAdmin } from "@/lib/session";
import { NotificationSchema } from "@/validations";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "./auth";

export async function sendNotificationAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Access denied" };

  const parsed = NotificationSchema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid notification data",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await notifyUser(
    parsed.data.userId,
    "SYSTEM",
    parsed.data.title,
    parsed.data.message,
    { sentBy: admin.userId },
  );
  await createAuditLog({
    userId: admin.userId,
    action: "SEND_NOTIFICATION",
    entity: "User",
    entityId: parsed.data.userId,
    newValues: { title: parsed.data.title },
  });

  revalidatePath("/admin/customers");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function setCustomerActiveAction(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Access denied" };
  if (admin.userId === userId) return { success: false, error: "You cannot change your own account status" };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "Customer not found" };

  await db.user.update({ where: { id: userId }, data: { isActive } });
  await createAuditLog({
    userId: admin.userId,
    action: isActive ? "REACTIVATE_CUSTOMER" : "SUSPEND_CUSTOMER",
    entity: "User",
    entityId: userId,
    oldValues: { isActive: user.isActive },
    newValues: { isActive },
  });

  revalidatePath("/admin/customers");
  return { success: true, data: undefined };
}
