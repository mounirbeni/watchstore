"use server";

import { db } from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/session";
import { createAuditLog, notifyUser } from "@/lib/audit";
import { ReservationSchema, ReviewReservationSchema } from "@/validations";
import { revalidatePath } from "next/cache";
import { ReservationStatus } from "@prisma/client";
import type { ActionResult } from "./auth";

export async function createReservationAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await requireAuth().catch(() => null);
  if (!session) return { success: false, error: "Connexion requise" };

  const raw = { productId: formData.get("productId"), notes: formData.get("notes") };
  const parsed = ReservationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const product = await db.product.findUnique({
    where: { id: parsed.data.productId, isActive: true },
  });
  if (!product) return { success: false, error: "Produit introuvable" };

  // Check for existing pending reservation
  const existing = await db.reservation.findFirst({
    where: {
      userId: session.userId,
      productId: parsed.data.productId,
      status: ReservationStatus.PENDING,
    },
  });
  if (existing) {
    return { success: false, error: "Vous avez déjà une réservation en attente pour ce produit" };
  }

  const reservation = await db.reservation.create({
    data: {
      userId: session.userId,
      productId: parsed.data.productId,
      notes: parsed.data.notes,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    },
  });

  await notifyUser(session.userId, "RESERVATION_UPDATE",
    "Réservation créée",
    `Votre demande de réservation pour "${product.name}" a été reçue. Notre équipe vous contactera sous 24h.`,
    { reservationId: reservation.id });

  await createAuditLog({
    userId: session.userId,
    action: "CREATE_RESERVATION",
    entity: "Reservation",
    entityId: reservation.id,
    newValues: { productId: product.id, productName: product.name },
  });

  revalidatePath("/dashboard/reservations");
  revalidatePath("/admin/reservations");
  return { success: true, data: { id: reservation.id } };
}

export async function reviewReservationAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return { success: false, error: "Accès refusé" };

  const raw = {
    reservationId: formData.get("reservationId"),
    status: formData.get("status"),
    adminNotes: formData.get("adminNotes"),
  };

  const parsed = ReviewReservationSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const reservation = await db.reservation.findUnique({
    where: { id: parsed.data.reservationId },
    include: { product: true },
  });
  if (!reservation) return { success: false, error: "Réservation introuvable" };

  const newStatus = parsed.data.status as ReservationStatus;

  await db.reservation.update({
    where: { id: reservation.id },
    data: {
      status: newStatus,
      adminNotes: parsed.data.adminNotes,
      reviewedAt: new Date(),
      reviewedBy: admin.userId,
    },
  });

  const statusLabel = newStatus === ReservationStatus.APPROVED ? "approuvée" : "refusée";
  await notifyUser(reservation.userId, "RESERVATION_UPDATE",
    `Réservation ${statusLabel}`,
    `Votre réservation pour "${reservation.product.name}" a été ${statusLabel}.${
      parsed.data.adminNotes ? ` Note: ${parsed.data.adminNotes}` : ""
    }`,
    { reservationId: reservation.id });

  await createAuditLog({
    userId: admin.userId,
    action: `RESERVATION_${parsed.data.status}`,
    entity: "Reservation",
    entityId: reservation.id,
    oldValues: { status: reservation.status },
    newValues: { status: newStatus },
  });

  revalidatePath("/admin/reservations");
  revalidatePath("/dashboard/reservations");
  return { success: true, data: undefined };
}
