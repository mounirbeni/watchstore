import Badge from "@/components/ui/Badge";

const variants: Record<string, "gold" | "green" | "red" | "blue" | "orange" | "gray"> = {
  PENDING:    "orange",
  CONFIRMED:  "blue",
  PROCESSING: "blue",
  SHIPPED:    "gold",
  DELIVERED:  "green",
  CANCELLED:  "red",
  REFUNDED:   "gray",
  APPROVED:   "green",
  REJECTED:   "red",
  EXPIRED:    "gray",
  CONVERTED:  "green",
  PAID:       "green",
  FAILED:     "red",
  PARTIALLY_REFUNDED: "orange",
};

const labels: Record<string, string> = {
  PENDING:    "En attente",
  CONFIRMED:  "Confirmée",
  PROCESSING: "En préparation",
  SHIPPED:    "Expédiée",
  DELIVERED:  "Livrée",
  CANCELLED:  "Annulée",
  REFUNDED:   "Remboursée",
  APPROVED:   "Approuvée",
  REJECTED:   "Refusée",
  EXPIRED:    "Expirée",
  CONVERTED:  "Convertie",
  PAID:       "Payée",
  FAILED:     "Échouée",
  PARTIALLY_REFUNDED: "Remb. partiel",
};

export default function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? "gray"}>{labels[status] ?? status.replaceAll("_", " ")}</Badge>;
}
