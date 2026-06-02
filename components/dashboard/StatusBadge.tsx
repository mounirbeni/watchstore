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

export default function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? "gray"}>{status.replaceAll("_", " ")}</Badge>;
}
