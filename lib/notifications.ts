import { db } from "@/lib/db";
import { NotificationCategory, NotificationPriority, NotificationType, Role } from "@prisma/client";
import { sendEmail, renderEmail } from "@/lib/email";

const categoryToType: Record<NotificationCategory, NotificationType> = {
  ORDER: NotificationType.ORDER_UPDATE,
  SHIPPING: NotificationType.ORDER_UPDATE,
  PAYMENT: NotificationType.PAYMENT_UPDATE,
  RESERVATION: NotificationType.RESERVATION_UPDATE,
  ACCOUNT: NotificationType.SYSTEM,
  SECURITY: NotificationType.SYSTEM,
  INVENTORY: NotificationType.SYSTEM,
  SYSTEM: NotificationType.SYSTEM,
};

export interface NotifyInput {
  userId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  data?: Record<string, unknown>;
  /** Also send a transactional email (used for important/critical events). */
  email?: boolean;
  emailTo?: string | null;
}

/** Create a single in-app notification (and optionally an email). */
export async function createNotification(input: NotifyInput) {
  const priority = input.priority ?? NotificationPriority.STANDARD;

  const notification = await db.notification.create({
    data: {
      userId: input.userId,
      type: categoryToType[input.category],
      category: input.category,
      priority,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl ?? null,
      data: input.data ? JSON.stringify(input.data) : null,
    },
  });

  if (input.email) {
    let to = input.emailTo ?? null;
    if (!to) {
      const u = await db.user.findUnique({ where: { id: input.userId }, select: { email: true } });
      to = u?.email ?? null;
    }
    if (to) {
      await sendEmail({
        to,
        subject: input.title,
        html: renderEmail({
          title: input.title,
          message: input.message,
          actionUrl: input.actionUrl,
          actionLabel: input.actionLabel,
          priority,
        }),
      });
    }
  }

  return notification;
}

/** Fan a notification out to every active admin (e.g. new order, fraud alert). */
export async function notifyAdmins(input: Omit<NotifyInput, "userId" | "emailTo">) {
  const admins = await db.user.findMany({
    where: { role: Role.ADMIN, isActive: true },
    select: { id: true, email: true },
  });
  await Promise.all(admins.map((a) => createNotification({ ...input, userId: a.id, emailTo: a.email })));
}

// ─── Inventory helper: alert admins when a product runs low after a sale ──────

export async function checkLowStock(productId: string) {
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { name: true, stock: true, lowStockAt: true },
  });
  if (!product) return;

  if (product.stock <= 0) {
    await notifyAdmins({
      category: NotificationCategory.INVENTORY,
      priority: NotificationPriority.IMPORTANT,
      title: "Rupture de stock",
      message: `« ${product.name} » est en rupture de stock.`,
      actionUrl: "/admin/products",
    });
  } else if (product.stock <= product.lowStockAt) {
    await notifyAdmins({
      category: NotificationCategory.INVENTORY,
      priority: NotificationPriority.IMPORTANT,
      title: "Stock faible",
      message: `« ${product.name} » : il ne reste que ${product.stock} unité(s).`,
      actionUrl: "/admin/products",
    });
  }
}
