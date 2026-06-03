import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-luxury-dark border-t border-luxury-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-base font-serif font-bold gold-text mb-3">ChronoCraft</h3>
            <p className="text-sm text-luxury-muted leading-relaxed">
              Votre destination pour les montres authentiques. Qualité, élégance et prestige à chaque pièce.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-luxury-white mb-4 uppercase tracking-[0.18em]">Collection</h4>
            <ul className="space-y-2.5">
              {[
                ["Homme", "/shop?category=homme"],
                ["Femme", "/shop?category=femme"],
                ["Sport", "/shop?category=sport"],
                ["Haute Horlogerie", "/shop?category=luxe"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href!} className="text-sm text-luxury-muted hover:text-luxury-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-luxury-white mb-4 uppercase tracking-[0.18em]">Mon Compte</h4>
            <ul className="space-y-2.5">
              {[
                ["Tableau de bord", "/dashboard"],
                ["Mes commandes", "/dashboard/orders"],
                ["Mes réservations", "/dashboard/reservations"],
                ["Ma wishlist", "/dashboard/wishlist"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href!} className="text-sm text-luxury-muted hover:text-luxury-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-luxury-white mb-4 uppercase tracking-[0.18em]">Contact</h4>
            <ul className="space-y-2.5 text-sm text-luxury-muted">
              <li>Casablanca, Maroc</li>
              <li>+212 522 000 000</li>
              <li>contact@chronocraft.ma</li>
              <li className="pt-1">
                <span className="text-xs">Lun–Sam: 9h–18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-luxury-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-luxury-muted">
            © {new Date().getFullYear()} ChronoCraft. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            {[["Confidentialité", "/confidentialite"], ["CGV", "/cgv"], ["Mentions légales", "/mentions-legales"]].map(([label, href]) => (
              <Link key={label} href={href!} className="text-xs text-luxury-muted hover:text-luxury-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
