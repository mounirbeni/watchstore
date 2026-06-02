import { db } from "@/lib/db";

interface AuditParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditParams) {
  return db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}

const TYPE_TO_CATEGORY = {
  ORDER_UPDATE: "ORDER",
  RESERVATION_UPDATE: "RESERVATION",
  PAYMENT_UPDATE: "PAYMENT",
  PROMOTION: "SYSTEM",
  SYSTEM: "SYSTEM",
} as const;

/**
 * Backward-compatible wrapper. New code should call `createNotification` /
 * `notifyAdmins` from "@/lib/notifications" directly for category, priority,
 * actionUrl and email support.
 */
export async function notifyUser(
  userId: string,
  type: "ORDER_UPDATE" | "RESERVATION_UPDATE" | "PAYMENT_UPDATE" | "PROMOTION" | "SYSTEM",
  title: string,
  message: string,
  data?: Record<string, unknown>,
) {
  const { createNotification } = await import("@/lib/notifications");
  return createNotification({
    userId,
    category: TYPE_TO_CATEGORY[type] as "ORDER" | "RESERVATION" | "PAYMENT" | "SYSTEM",
    title,
    message,
    data,
  });
}
