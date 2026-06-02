import Badge from "@/components/ui/Badge";

const variants: Record<string, "gold" | "green" | "red" | "blue" | "orange" | "gray"> = {
  // Order statuses
  DRAFT:            "gray",
  AWAITING_DEPOSIT: "orange",
  DEPOSIT_PENDING:  "blue",
  DEPOSIT_PAID:     "green",
  CONFIRMED:        "green",
  PREPARING:        "blue",
  OUT_FOR_DELIVERY: "gold",
  DELIVERED:        "green",
  CANCELLED:        "red",
  REFUNDED:         "gray",
  // Payment statuses
  UNPAID:           "gray",
  DEPOSIT_FAILED:   "red",
  // Reservation statuses
  PENDING:          "orange",
  APPROVED:         "green",
  REJECTED:         "red",
  EXPIRED:          "gray",
  CONVERTED:        "green",
};

const labels: Record<string, string> = {
  // Order statuses
  DRAFT:            "Brouillon",
  AWAITING_DEPOSIT: "Acompte requis",
  DEPOSIT_PENDING:  "Acompte en vérification",
  DEPOSIT_PAID:     "Acompte payé",
  CONFIRMED:        "Confirmée",
  PREPARING:        "En préparation",
  OUT_FOR_DELIVERY: "En livraison",
  DELIVERED:        "Livrée",
  CANCELLED:        "Annulée",
  REFUNDED:         "Remboursée",
  // Payment statuses
  UNPAID:           "Non payé",
  DEPOSIT_FAILED:   "Acompte refusé",
  // Reservation statuses
  PENDING:          "En attente",
  APPROVED:         "Approuvée",
  REJECTED:         "Refusée",
  EXPIRED:          "Expirée",
  CONVERTED:        "Convertie",
};

export default function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? "gray"}>{labels[status] ?? status.replaceAll("_", " ")}</Badge>;
}
