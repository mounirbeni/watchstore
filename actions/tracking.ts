"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Public order lookup, for customers who checked out without an account.
 *
 * Two rules govern this file, because it answers to anyone on the internet:
 *
 * 1. A reference alone is never enough. Order numbers run in sequence and
 *    carrier tracking numbers are printed on the parcel, so either could be
 *    guessed or read by a stranger. We also require the phone number attached
 *    to the order, which only the customer and we know.
 *
 * 2. Failures are indistinguishable. A wrong reference and a right reference
 *    with the wrong phone return the same message, so the form cannot be used
 *    to discover which order numbers exist.
 */

/** What a stranger holding the right reference and phone is allowed to see. */
export interface PublicTracking {
  orderNumber: string;
  status: string;
  createdAt: Date;
  confirmedAt: Date | null;
  preparingAt: Date | null;
  shippedAt: Date | null;
  outForDeliveryAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  trackingNumber: string | null;
  carrierName: string | null;
  courierName: string | null;
  courierPhone: string | null;
  city: string | null;
  amountDue: number;
  items: { name: string; quantity: number }[];
}

export type TrackingLookup =
  | { success: true; data: PublicTracking }
  | { success: false; error: string };

/** Same wording whatever went wrong — see rule 2 above. */
const NOT_FOUND =
  "Aucune commande ne correspond à ces informations. Vérifiez le numéro et le téléphone utilisés lors de la commande.";

/**
 * Reduce a Moroccan number to its 9 significant digits so that
 * "+212 600-112233", "0600112233" and "0600 11 22 33" all compare equal.
 */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("212") ? digits.slice(3) : digits;
  return withoutCountry.replace(/^0+/, "");
}

export async function lookupOrderAction(formData: FormData): Promise<TrackingLookup> {
  const reference = String(formData.get("reference") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!reference || !phone) {
    return { success: false, error: "Renseignez le numéro de commande et votre téléphone." };
  }

  // Throttle per IP: enough for a customer correcting a typo, not enough to
  // sweep the order-number space. In-memory, so the ceiling is per instance.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const limit = checkRateLimit(`tracking:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      success: false,
      error: "Trop de tentatives. Merci de réessayer dans quelques minutes.",
    };
  }

  const normalisedPhone = normalisePhone(phone);
  if (normalisedPhone.length < 9) {
    return { success: false, error: NOT_FOUND };
  }

  // Accept either reference the customer is likely to be holding.
  const order = await db.order.findFirst({
    where: {
      OR: [
        { orderNumber: { equals: reference, mode: "insensitive" } },
        { trackingNumber: { equals: reference, mode: "insensitive" } },
      ],
    },
    select: {
      orderNumber: true,
      status: true,
      createdAt: true,
      confirmedAt: true,
      preparingAt: true,
      shippedAt: true,
      outForDeliveryAt: true,
      deliveredAt: true,
      cancelledAt: true,
      trackingNumber: true,
      carrierName: true,
      courierName: true,
      courierPhone: true,
      customerPhone: true,
      total: true,
      remainingBalance: true,
      address: { select: { city: true, phone: true } },
      items: { select: { productName: true, quantity: true } },
    },
  });

  if (!order) return { success: false, error: NOT_FOUND };

  // The phone may live on the order or on the delivery address; either matches.
  const candidates = [order.customerPhone, order.address?.phone]
    .filter((p): p is string => Boolean(p))
    .map(normalisePhone);

  if (!candidates.includes(normalisedPhone)) {
    return { success: false, error: NOT_FOUND };
  }

  // Deliberately narrow: no street, no email, no payment or proof details.
  return {
    success: true,
    data: {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      shippedAt: order.shippedAt,
      outForDeliveryAt: order.outForDeliveryAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      trackingNumber: order.trackingNumber,
      carrierName: order.carrierName,
      courierName: order.courierName,
      courierPhone: order.courierPhone,
      city: order.address?.city ?? null,
      amountDue: Number(order.remainingBalance) > 0
        ? Number(order.remainingBalance)
        : Number(order.total),
      items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity })),
    },
  };
}
