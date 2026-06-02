"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { requireAuth, requireAdmin } from "@/lib/session";
import { createAuditLog } from "@/lib/audit";
import { createNotification, notifyAdmins, checkLowStock } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import { computePricing } from "@/lib/pricing";
import { generateOrderNumber, formatPrice } from "@/lib/utils";
import { NotificationCategory, NotificationPriority } from "@prisma/client";
import {
  CheckoutSchema,
  SubmitDepositSchema,
  ReviewDepositSchema,
  UpdateOrderStatusSchema,
  CancelOrderSchema,
} from "@/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import type { ActionResult } from "./auth";

// Statuses in which stock has already been deducted from inventory.
const STOCK_DEDUCTED: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

async function getClientMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") || null;
  return { ip, userAgent };
}

function revalidateOrderViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// ─── Create order (deposit-based COD) ────────────────────────────────────────

export async function createOrderAction(formData: FormData): Promise<ActionResult<{ orderNumber: string }>> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  // Rate limit checkout attempts per user (anti-spam).
  const rl = checkRateLimit(`checkout:${session.userId}`, 6, 60_000);
  if (!rl.allowed) return { success: false, error: "Trop de tentatives. Réessayez dans une minute." };

  const parsed = CheckoutSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      success: false,
      error: "Veuillez vérifier vos informations.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } } },
  });
  if (!cart || cart.items.length === 0) return { success: false, error: "Votre panier est vide." };

  const address = await db.address.findFirst({
    where: { id: parsed.data.addressId, userId: session.userId },
  });
  if (!address) return { success: false, error: "Adresse de livraison invalide." };

  // Stock validation.
  for (const item of cart.items) {
    if (!item.product.isActive) return { success: false, error: `Produit indisponible : ${item.product.name}` };
    if (item.product.stock < item.quantity) {
      return { success: false, error: `Stock insuffisant : ${item.product.name}` };
    }
  }

  // Fraud: block an identical pending order created in the last 15 minutes.
  const productIds = [...cart.items.map((i) => i.productId)].sort();
  const recent = await db.order.findMany({
    where: {
      userId: session.userId,
      status: { in: [OrderStatus.AWAITING_DEPOSIT, OrderStatus.DEPOSIT_PENDING] },
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
    include: { items: true },
  });
  const duplicate = recent.some(
    (o) => JSON.stringify([...o.items.map((i) => i.productId)].sort()) === JSON.stringify(productIds),
  );
  if (duplicate) {
    return { success: false, error: "Vous avez déjà une commande en attente d'acompte pour ces articles." };
  }

  // Risk flag: many orders in a short window.
  const ordersLastHour = await db.order.count({
    where: { userId: session.userId, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  const flagged = ordersLastHour >= 4;

  const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
  const pricing = computePricing(subtotal);
  const { ip, userAgent } = await getClientMeta();
  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session.userId,
      addressId: address.id,
      status: OrderStatus.AWAITING_DEPOSIT,
      subtotal: pricing.subtotal,
      shippingCost: pricing.shipping,
      discount: 0,
      total: pricing.total,
      depositAmount: pricing.deposit,
      remainingBalance: pricing.remaining,
      customerPhone: parsed.data.phone,
      notes: parsed.data.notes,
      ipAddress: ip,
      userAgent: userAgent ?? undefined,
      flagged,
      riskNote: flagged ? `${ordersLastHour} commandes dans la dernière heure` : null,
      items: {
        create: cart.items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          imageUrl: item.product.images[0]?.url ?? null,
          quantity: item.quantity,
          unitPrice: Number(item.product.price),
          total: Number(item.product.price) * item.quantity,
        })),
      },
      payment: {
        create: {
          userId: session.userId,
          amount: pricing.deposit,
          currency: "MAD",
          method: parsed.data.method as PaymentMethod,
          status: PaymentStatus.UNPAID,
        },
      },
    },
  });

  // Save phone to profile if missing (smoother future checkouts).
  await db.customerProfile.updateMany({
    where: { userId: session.userId, OR: [{ phone: null }, { phone: "" }] },
    data: { phone: parsed.data.phone },
  });

  // Clear the cart — the items are now captured on the order.
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  await createNotification({
    userId: session.userId,
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.IMPORTANT,
    title: "Acompte requis pour confirmer",
    message: `Votre commande ${orderNumber} est enregistrée. Réglez l'acompte de ${formatPrice(pricing.deposit)} pour la confirmer. Le solde de ${formatPrice(pricing.remaining)} sera payé à la livraison.`,
    actionUrl: `/checkout/confirmation/${orderNumber}`,
    data: { orderNumber },
  });

  // Admin notifications: new order + fraud alert if flagged.
  await notifyAdmins({
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.IMPORTANT,
    title: "Nouvelle commande",
    message: `Commande ${orderNumber} (${formatPrice(pricing.total)}) en attente d'acompte.`,
    actionUrl: "/admin/orders",
  });
  if (flagged) {
    await notifyAdmins({
      category: NotificationCategory.SECURITY,
      priority: NotificationPriority.CRITICAL,
      title: "Activité suspecte détectée",
      message: `La commande ${orderNumber} est marquée à risque : ${ordersLastHour} commandes en 1 h depuis la même session.`,
      actionUrl: "/admin/orders?status=AWAITING_DEPOSIT",
      email: true,
    });
  }

  await createAuditLog({
    userId: session.userId,
    action: "CREATE_ORDER",
    entity: "Order",
    entityId: order.id,
    newValues: { orderNumber, total: String(pricing.total), deposit: String(pricing.deposit), flagged },
    ipAddress: ip ?? undefined,
    userAgent: userAgent ?? undefined,
  });

  revalidateOrderViews();
  redirect(`/checkout/confirmation/${orderNumber}`);
}

// ─── Customer submits deposit proof ──────────────────────────────────────────

export async function submitDepositProofAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const parsed = SubmitDepositSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      success: false,
      error: "Veuillez vérifier la référence de paiement.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const order = await db.order.findFirst({
    where: { id: parsed.data.orderId, userId: session.userId },
    include: { payment: true },
  });
  if (!order || !order.payment) return { success: false, error: "Commande introuvable." };

  const resubmittable: OrderStatus[] = [OrderStatus.AWAITING_DEPOSIT, OrderStatus.DEPOSIT_PENDING];
  if (!resubmittable.includes(order.status)) {
    return { success: false, error: "Cette commande ne nécessite plus d'acompte." };
  }

  await db.payment.update({
    where: { id: order.payment.id },
    data: {
      method: parsed.data.method as PaymentMethod,
      proofReference: parsed.data.reference,
      proofUrl: parsed.data.proofUrl,
      status: PaymentStatus.DEPOSIT_PENDING,
      failedAt: null,
    },
  });
  await db.order.update({ where: { id: order.id }, data: { status: OrderStatus.DEPOSIT_PENDING } });

  await createNotification({
    userId: session.userId,
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.STANDARD,
    title: "Preuve d'acompte reçue",
    message: `Nous avons bien reçu votre preuve de paiement pour la commande ${order.orderNumber}. Notre équipe la vérifie et confirmera votre commande sous peu.`,
    actionUrl: `/dashboard/orders/${order.orderNumber}`,
    data: { orderNumber: order.orderNumber },
  });

  await notifyAdmins({
    category: NotificationCategory.PAYMENT,
    priority: NotificationPriority.IMPORTANT,
    title: "Acompte à vérifier",
    message: `Preuve de paiement reçue pour la commande ${order.orderNumber} (${parsed.data.method}). Réf : ${parsed.data.reference}.`,
    actionUrl: "/admin/orders?status=DEPOSIT_PENDING",
  });

  await createAuditLog({
    userId: session.userId,
    action: "SUBMIT_DEPOSIT_PROOF",
    entity: "Order",
    entityId: order.id,
    newValues: { method: parsed.data.method, reference: parsed.data.reference },
  });

  revalidateOrderViews();
  revalidatePath(`/checkout/confirmation/${order.orderNumber}`);
  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { success: true, data: undefined };
}

// ─── Admin reviews the deposit (approve / reject) ────────────────────────────

export async function reviewDepositAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const parsed = ReviewDepositSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payment: true, items: true },
  });
  if (!order || !order.payment) return { success: false, error: "Commande introuvable." };

  if (parsed.data.decision === "APPROVE") {
    // Re-validate stock before confirming.
    for (const item of order.items) {
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        return { success: false, error: `Stock insuffisant : ${item.productName}` };
      }
    }

    await db.payment.update({
      where: { id: order.payment.id },
      data: {
        status: PaymentStatus.DEPOSIT_PAID,
        paidAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: admin.userId,
        transactionRef: order.payment.proofReference,
      },
    });
    await db.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
        adminNotes: parsed.data.adminNote ?? order.adminNotes,
      },
    });

    // Deduct stock now that the order is real, then alert admins on low stock.
    for (const item of order.items) {
      await db.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      await checkLowStock(item.productId);
    }
    await db.customerProfile.updateMany({
      where: { userId: order.userId },
      data: { orderCount: { increment: 1 } },
    });

    await createNotification({
      userId: order.userId,
      category: NotificationCategory.ORDER,
      priority: NotificationPriority.IMPORTANT,
      title: "Commande confirmée ✓",
      message: `Votre acompte est validé et votre commande ${order.orderNumber} est confirmée. Le solde de ${formatPrice(Number(order.remainingBalance))} sera réglé à la livraison.`,
      actionUrl: `/dashboard/orders/${order.orderNumber}`,
      email: true,
      data: { orderNumber: order.orderNumber },
    });
  } else {
    await db.payment.update({
      where: { id: order.payment.id },
      data: { status: PaymentStatus.DEPOSIT_FAILED, failedAt: new Date(), reviewedAt: new Date(), reviewedBy: admin.userId },
    });
    await db.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.AWAITING_DEPOSIT, adminNotes: parsed.data.adminNote ?? order.adminNotes },
    });

    await createNotification({
      userId: order.userId,
      category: NotificationCategory.PAYMENT,
      priority: NotificationPriority.IMPORTANT,
      title: "Acompte non validé",
      message: `Nous n'avons pas pu valider votre acompte pour la commande ${order.orderNumber}.${
        parsed.data.adminNote ? ` Motif : ${parsed.data.adminNote}.` : ""
      } Vous pouvez renvoyer une nouvelle preuve de paiement.`,
      actionUrl: `/dashboard/orders/${order.orderNumber}`,
      email: true,
      data: { orderNumber: order.orderNumber },
    });
  }

  await createAuditLog({
    userId: admin.userId,
    action: `REVIEW_DEPOSIT_${parsed.data.decision}`,
    entity: "Order",
    entityId: order.id,
    oldValues: { status: order.status },
    newValues: { decision: parsed.data.decision },
  });

  revalidateOrderViews();
  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { success: true, data: undefined };
}

// ─── Admin updates fulfilment status ─────────────────────────────────────────

export async function updateOrderStatusAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const parsed = UpdateOrderStatusSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Statut invalide" };

  const order = await db.order.findUnique({ where: { id: parsed.data.orderId }, include: { items: true } });
  if (!order) return { success: false, error: "Commande introuvable." };

  const status = parsed.data.status as OrderStatus;
  const data: Record<string, unknown> = { status };
  if (parsed.data.adminNote) data["adminNotes"] = parsed.data.adminNote;
  if (status === OrderStatus.CONFIRMED && !order.confirmedAt) data["confirmedAt"] = new Date();
  if (status === OrderStatus.PREPARING) data["preparingAt"] = new Date();
  if (status === OrderStatus.OUT_FOR_DELIVERY) data["outForDeliveryAt"] = new Date();
  if (status === OrderStatus.DELIVERED) {
    data["deliveredAt"] = new Date();
    data["remainingBalance"] = 0;
  }
  if (status === OrderStatus.CANCELLED) data["cancelledAt"] = new Date();

  // Restore stock if we leave a stock-deducted state for cancel/refund.
  const wasDeducted = STOCK_DEDUCTED.includes(order.status);
  const nowReleased = status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;
  if (wasDeducted && nowReleased) {
    for (const item of order.items) {
      await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }

  await db.order.update({ where: { id: order.id }, data });

  const labels: Partial<Record<OrderStatus, string>> = {
    CONFIRMED: "confirmée",
    PREPARING: "en préparation",
    OUT_FOR_DELIVERY: "en cours de livraison",
    DELIVERED: "livrée",
    CANCELLED: "annulée",
    REFUNDED: "remboursée",
  };
  const label = labels[status];
  if (label) {
    const isShipping = status === OrderStatus.OUT_FOR_DELIVERY || status === OrderStatus.DELIVERED;
    const important =
      status === OrderStatus.CONFIRMED || status === OrderStatus.DELIVERED || status === OrderStatus.OUT_FOR_DELIVERY;
    await createNotification({
      userId: order.userId,
      category: isShipping ? NotificationCategory.SHIPPING : NotificationCategory.ORDER,
      priority: important ? NotificationPriority.IMPORTANT : NotificationPriority.STANDARD,
      title: "Mise à jour de commande",
      message: `Votre commande ${order.orderNumber} est ${label}.`,
      actionUrl: `/dashboard/orders/${order.orderNumber}`,
      email: isShipping, // shipped / out-for-delivery / delivered -> email
      data: { orderNumber: order.orderNumber, status },
    });
  }

  await createAuditLog({
    userId: admin.userId,
    action: "UPDATE_ORDER_STATUS",
    entity: "Order",
    entityId: order.id,
    oldValues: { status: order.status },
    newValues: { status },
  });

  revalidateOrderViews();
  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { success: true, data: undefined };
}

export async function updateAdminOrderAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "AccÃ¨s refusÃ©" };

  const orderId = String(formData.get("orderId") ?? "");
  const statusValue = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!orderId) return { success: false, error: "Commande introuvable." };
  if (!Object.values(OrderStatus).includes(statusValue as OrderStatus)) {
    return { success: false, error: "Statut invalide" };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { success: false, error: "Commande introuvable." };

  const status = statusValue as OrderStatus;
  const data: Record<string, unknown> = {
    status,
    adminNotes: adminNotes || null,
    trackingNumber: trackingNumber || null,
    customerPhone: customerPhone || null,
  };

  if (status === OrderStatus.CONFIRMED && !order.confirmedAt) data["confirmedAt"] = new Date();
  if (status === OrderStatus.PREPARING && !order.preparingAt) data["preparingAt"] = new Date();
  if (status === OrderStatus.OUT_FOR_DELIVERY && !order.outForDeliveryAt) data["outForDeliveryAt"] = new Date();
  if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
    data["deliveredAt"] = new Date();
    data["remainingBalance"] = 0;
  }
  if (status === OrderStatus.CANCELLED && !order.cancelledAt) data["cancelledAt"] = new Date();

  const wasDeducted = STOCK_DEDUCTED.includes(order.status);
  const nowReleased = status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;
  if (wasDeducted && nowReleased) {
    for (const item of order.items) {
      await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }

  await db.order.update({ where: { id: order.id }, data });

  await createAuditLog({
    userId: admin.userId,
    action: "ADMIN_UPDATE_ORDER",
    entity: "Order",
    entityId: order.id,
    oldValues: {
      status: order.status,
      adminNotes: order.adminNotes,
      trackingNumber: order.trackingNumber,
      customerPhone: order.customerPhone,
    },
    newValues: { status, adminNotes: adminNotes || null, trackingNumber: trackingNumber || null, customerPhone: customerPhone || null },
  });

  await createNotification({
    userId: order.userId,
    category: status === OrderStatus.OUT_FOR_DELIVERY || status === OrderStatus.DELIVERED
      ? NotificationCategory.SHIPPING
      : NotificationCategory.ORDER,
    priority: NotificationPriority.IMPORTANT,
    title: "Mise Ã  jour de commande",
    message: `Votre commande ${order.orderNumber} est maintenant ${status}.`,
    actionUrl: `/dashboard/orders/${order.orderNumber}`,
    data: { orderNumber: order.orderNumber, status, trackingNumber: trackingNumber || null },
  });

  revalidateOrderViews();
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { success: true, data: undefined };
}

// ─── Cancel order (customer or admin) ────────────────────────────────────────

const CLIENT_CANCELLABLE: OrderStatus[] = [
  OrderStatus.AWAITING_DEPOSIT,
  OrderStatus.DEPOSIT_PENDING,
  OrderStatus.CONFIRMED,
];

export async function cancelOrderAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const parsed = CancelOrderSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const order = await db.order.findFirst({
    where: { id: parsed.data.orderId, userId: session.userId },
    include: { items: true },
  });
  if (!order) return { success: false, error: "Commande introuvable." };

  if (!CLIENT_CANCELLABLE.includes(order.status)) {
    return { success: false, error: "Cette commande ne peut plus être annulée. Contactez le support." };
  }

  // Restore stock if it had been deducted (CONFIRMED).
  if (STOCK_DEDUCTED.includes(order.status)) {
    for (const item of order.items) {
      await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: parsed.data.reason ?? "Annulée par le client",
    },
  });

  await createNotification({
    userId: order.userId,
    category: NotificationCategory.ORDER,
    priority: NotificationPriority.IMPORTANT,
    title: "Commande annulée",
    message: `Votre commande ${order.orderNumber} a été annulée.`,
    actionUrl: `/dashboard/orders/${order.orderNumber}`,
    data: { orderNumber: order.orderNumber },
  });

  await createAuditLog({
    userId: session.userId,
    action: "CANCEL_ORDER",
    entity: "Order",
    entityId: order.id,
    oldValues: { status: order.status },
    newValues: { status: OrderStatus.CANCELLED, reason: parsed.data.reason },
  });

  revalidateOrderViews();
  revalidatePath(`/dashboard/orders/${order.orderNumber}`);
  return { success: true, data: undefined };
}
