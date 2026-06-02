import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-luxury-dark border-t border-luxury-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-serif gold-text font-bold mb-4">ChronoCraft</h3>
            <p className="text-sm text-luxury-muted leading-relaxed">
              Votre destination pour les montres de luxe authentiques. Qualité, élégance, et prestige à chaque pièce.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-luxury-light mb-4 uppercase tracking-wider">Collection</h4>
            <ul className="space-y-2">
              {[
                ["Homme", "/shop?category=homme"],
                ["Femme", "/shop?category=femme"],
                ["Sport", "/shop?category=sport"],
                ["Haute Horlogerie", "/shop?category=luxe"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href!} className="text-sm text-luxury-muted hover:text-gold-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-luxury-light mb-4 uppercase tracking-wider">Mon Compte</h4>
            <ul className="space-y-2">
              {[
                ["Tableau de bord", "/dashboard"],
                ["Mes commandes", "/dashboard/orders"],
                ["Mes réservations", "/dashboard/reservations"],
                ["Ma wishlist", "/dashboard/wishlist"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href!} className="text-sm text-luxury-muted hover:text-gold-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-luxury-light mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-luxury-muted">
              <li>Casablanca, Maroc</li>
              <li>+212 522 000 000</li>
              <li>contact@chronocraft.ma</li>
              <li className="pt-2">
                <span className="text-xs text-luxury-muted">Lun–Sam: 9h–18h</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-luxury-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-luxury-muted">
            © {new Date().getFullYear()} ChronoCraft. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-luxury-muted hover:text-gold-400 transition-colors">Confidentialité</Link>
            <Link href="#" className="text-xs text-luxury-muted hover:text-gold-400 transition-colors">CGV</Link>
            <Link href="#" className="text-xs text-luxury-muted hover:text-gold-400 transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
