import {
  Watch,
  Sparkles,
  Gem,
  Cpu,
  Gift,
  Crown,
  Timer,
  type LucideIcon,
} from "lucide-react";

export interface NavCategory {
  href: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
}

/** Collection taxonomy shared by the desktop mega-menu, the mobile drawer and the footer. */
export const NAV_CATEGORIES: NavCategory[] = [
  { href: "/shop?category=homme", label: "Homme", hint: "Élégance & caractère", Icon: Watch },
  { href: "/shop?category=femme", label: "Femme", hint: "Grâce & raffinement", Icon: Sparkles },
  { href: "/shop?category=sport", label: "Sport", hint: "Endurance & précision", Icon: Timer },
  { href: "/shop?category=luxe", label: "Haute Horlogerie", hint: "Pièces d'exception", Icon: Crown },
  { href: "/shop?category=smart", label: "Smart", hint: "Technologie connectée", Icon: Cpu },
  { href: "/shop?category=pack", label: "Pack & Coffrets", hint: "Idées cadeaux", Icon: Gift },
  { href: "/shop?category=limited-edition", label: "Édition Limitée", hint: "Séries numérotées", Icon: Gem },
];

export interface NavLink {
  href: string;
  label: string;
}

export const PRIMARY_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Collection" },
  { href: "/about", label: "À propos" },
  { href: "/faq", label: "FAQ" },
];
