import {
  ShoppingBag, CreditCard, CalendarClock, Truck, User, ShieldAlert, Package, Settings,
  type LucideIcon,
} from "lucide-react";

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export const CATEGORY_META: Record<string, { label: string; Icon: LucideIcon }> = {
  ORDER:       { label: "Commandes",     Icon: ShoppingBag },
  PAYMENT:     { label: "Paiements",     Icon: CreditCard },
  RESERVATION: { label: "Réservations",  Icon: CalendarClock },
  SHIPPING:    { label: "Livraison",     Icon: Truck },
  ACCOUNT:     { label: "Compte",        Icon: User },
  SECURITY:    { label: "Sécurité",      Icon: ShieldAlert },
  INVENTORY:   { label: "Stock",         Icon: Package },
  SYSTEM:      { label: "Système",       Icon: Settings },
};

export const CATEGORIES = Object.keys(CATEGORY_META);

/** Priority → accent classes (dot + icon tint). */
export const PRIORITY_ACCENT: Record<string, { dot: string; ring: string; text: string }> = {
  CRITICAL:  { dot: "bg-red-500",   ring: "bg-red-500/10 text-red-400",     text: "text-red-400" },
  IMPORTANT: { dot: "bg-gold-500",  ring: "bg-gold-500/10 text-gold-400",   text: "text-gold-400" },
  STANDARD:  { dot: "bg-luxury-muted", ring: "bg-luxury-border/60 text-luxury-light", text: "text-luxury-muted" },
};

export function timeAgoShort(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
