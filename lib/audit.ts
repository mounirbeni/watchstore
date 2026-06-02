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

export async function notifyUser(
  userId: string,
  type: "ORDER_UPDATE" | "RESERVATION_UPDATE" | "PAYMENT_UPDATE" | "PROMOTION" | "SYSTEM",
  title: string,
  message: string,
  data?: Record<string, unknown>,
) {
  return db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null,
    },
  });
}
