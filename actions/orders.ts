"use server";

import { db } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/session";
import { createAuditLog, notifyUser } from "@/lib/audit";
import { CheckoutSchema } from "@/validations";
import { generateOrderNumber } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import type { ActionResult } from "./auth";

export async function createOrderAction(formData: FormData): Promise<ActionResult<{ orderNumber: string }>> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = CheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const cart = await db.cart.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
  });

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Panier vide" };
  }

  const address = await db.address.findUnique({
    where: { id: parsed.data.addressId, userId: session.userId },
  });
  if (!address) return { success: false, error: "Adresse invalide" };

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return { success: false, error: `Stock insuffisant: ${item.product.name}` };
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const total = subtotal; // shipping could be added here

  const orderNumber = generateOrderNumber();

  const order = await db.order.create({
    data: {
      orderNumber,
      userId: session.userId,
      addressId: address.id,
      status: OrderStatus.PENDING,
      subtotal,
      shippingCost: 0,
      discount: 0,
      total,
      notes: parsed.data.notes,
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
          amount: total,
          currency: "MAD",
          method: parsed.data.paymentMethod as "CARD" | "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "CRYPTO",
          status: "PENDING",
        },
      },
    },
  });

  // Decrement stock
  for (const item of cart.items) {
    await db.product.update({
      where: { id: item.product.id },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // Clear cart
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  // Update customer stats
  await db.customerProfile.updateMany({
    where: { userId: session.userId },
    data: {
      totalSpent: { increment: total },
      orderCount: { increment: 1 },
    },
  });

  await notifyUser(session.userId, "ORDER_UPDATE",
    "Commande confirmée",
    `Votre commande ${orderNumber} a été reçue et est en cours de traitement.`,
    { orderNumber });

  await createAuditLog({
    userId: session.userId,
    action: "CREATE_ORDER",
    entity: "Order",
    entityId: order.id,
    newValues: { orderNumber, total: String(total) },
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/orders");
  redirect(`/dashboard/orders?created=${encodeURIComponent(orderNumber)}`);
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) return { success: false, error: "Commande introuvable" };

  const updateData: Record<string, unknown> = { status };
  if (status === OrderStatus.SHIPPED) updateData["shippedAt"] = new Date();
  if (status === OrderStatus.DELIVERED) updateData["deliveredAt"] = new Date();
  if (status === OrderStatus.CANCELLED) updateData["cancelledAt"] = new Date();

  await db.order.update({ where: { id: orderId }, data: updateData });

  if (status === OrderStatus.DELIVERED && order.payment) {
    await db.payment.update({
      where: { id: order.payment.id },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  const statusLabels: Partial<Record<OrderStatus, string>> = {
    CONFIRMED: "confirmée",
    PROCESSING: "en cours de préparation",
    SHIPPED: "expédiée",
    DELIVERED: "livrée",
    CANCELLED: "annulée",
  };

  const label = statusLabels[status];
  if (label) {
    await notifyUser(order.userId, "ORDER_UPDATE",
      "Mise à jour commande",
      `Votre commande ${order.orderNumber} est ${label}.`,
      { orderNumber: order.orderNumber, status });
  }

  await createAuditLog({
    userId: admin.userId,
    action: "UPDATE_ORDER_STATUS",
    entity: "Order",
    entityId: orderId,
    oldValues: { status: order.status },
    newValues: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/orders");
  return { success: true, data: undefined };
}
