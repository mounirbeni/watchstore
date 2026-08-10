import Link from "next/link";
import {
  ArrowUpRight,
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import Logo, { BRAND } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Collection",
    links: [
      ["Homme", "/shop?category=homme"],
      ["Femme", "/shop?category=femme"],
      ["Sport", "/shop?category=sport"],
      ["Haute Horlogerie", "/shop?category=luxe"],
    ],
  },
  {
    title: "Mon Compte",
    links: [
      ["Tableau de bord", "/dashboard"],
      ["Mes commandes", "/dashboard/orders"],
      ["Mes réservations", "/dashboard/reservations"],
      ["Ma wishlist", "/dashboard/wishlist"],
    ],
  },
  {
    title: "Informations",
    links: [
      ["À propos", "/about"],
      ["FAQ", "/faq"],
      ["Paiement & Livraison", "/paiement-livraison"],
    ],
  },
] as const;

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "WhatsApp", href: "https://wa.me/212600000000", Icon: MessageCircle },
];

const GUARANTEES = [
  { Icon: ShieldCheck, label: "Authenticité garantie" },
  { Icon: Truck, label: "Livraison 48h" },
  { Icon: RotateCcw, label: "Retours 30 jours" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-luxury-border bg-luxury-dark">
      {/* Guarantee strip */}
      <div className="border-b border-luxury-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-3 sm:px-6">
          {GUARANTEES.map(({ Icon, label }) => (
            <div key={label} className="flex items-center justify-center gap-2.5">
              <Icon className="h-4 w-4 text-gold-500" strokeWidth={1.8} />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-luxury-light">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" withTagline href={null} />
            <p className="mt-4 text-sm leading-relaxed text-luxury-muted">
              Votre destination pour les montres authentiques. Qualité, élégance et prestige à chaque pièce.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-luxury-border bg-white text-luxury-light transition-all hover:-translate-y-0.5 hover:border-gold-500/50 hover:text-gold-500"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-luxury-white">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-1 text-sm text-luxury-muted transition-colors hover:text-gold-600"
                    >
                      {label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-luxury-white">
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-luxury-muted">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-500" strokeWidth={1.8} />
                Casablanca, Maroc
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-gold-500" strokeWidth={1.8} />
                <a href="tel:+212522000000" className="transition-colors hover:text-gold-600">
                  +212 522 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-gold-500" strokeWidth={1.8} />
                <a href="mailto:contact@chronocraft.ma" className="transition-colors hover:text-gold-600">
                  contact@chronocraft.ma
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1 text-xs">
                <Clock className="h-3.5 w-3.5 shrink-0 text-gold-500" strokeWidth={1.8} />
                Lun–Sam: 9h–18h
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-luxury-border pt-6 sm:flex-row">
          <p className="text-xs text-luxury-muted">
            © {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            {[
              ["Confidentialité", "/confidentialite"],
              ["CGV", "/cgv"],
              ["Mentions légales", "/mentions-legales"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href!}
                className="text-xs text-luxury-muted transition-colors hover:text-gold-600"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
