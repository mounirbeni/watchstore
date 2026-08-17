/**
 * Shared vocabulary for the fulfilment timeline.
 *
 * Both the signed-in order page and the public tracking page render the same
 * stages; keeping the labels, the ordering and the rank logic here means a
 * change to the funnel cannot land in one view and miss the other.
 */

export interface TimelineStage {
  key: string;
  label: string;
  desc: string;
}

export const TIMELINE_STAGES: TimelineStage[] = [
  { key: "created",   label: "Commande créée",       desc: "Votre commande a bien été reçue" },
  { key: "confirmed", label: "Confirmée",            desc: "Acompte validé — commande en traitement" },
  { key: "preparing", label: "En préparation",       desc: "Votre montre est en cours de préparation" },
  { key: "shipped",   label: "Expédiée",             desc: "Colis pris en charge par le transporteur" },
  { key: "delivery",  label: "En cours de livraison", desc: "Votre colis est en route vers vous" },
  { key: "delivered", label: "Livrée",               desc: "Commande livrée avec succès" },
];

/** How far along the timeline a status sits. -1 for cancelled / unknown. */
export function rankFor(status: string): number {
  switch (status) {
    case "DRAFT":
    case "PENDING":
    case "AWAITING_DEPOSIT":
    case "DEPOSIT_PENDING":  return 0;
    case "DEPOSIT_PAID":
    case "CONFIRMED":
    case "PROCESSING":       return 1;
    case "PREPARING":        return 2;
    case "SHIPPED":          return 3;
    case "OUT_FOR_DELIVERY": return 4;
    case "DELIVERED":        return 5;
    default:                 return -1;
  }
}

export function formatTimestamp(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** The timestamps a stage reads from, in stage order. */
export interface StageTimestamps {
  createdAt: Date;
  confirmedAt: Date | null;
  preparingAt: Date | null;
  shippedAt: Date | null;
  outForDeliveryAt: Date | null;
  deliveredAt: Date | null;
}

export function stageTimestamps(order: StageTimestamps): (Date | null)[] {
  return [
    order.createdAt,
    order.confirmedAt,
    order.preparingAt,
    order.shippedAt,
    order.outForDeliveryAt,
    order.deliveredAt,
  ];
}
