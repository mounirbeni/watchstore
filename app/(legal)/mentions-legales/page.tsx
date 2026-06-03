import LegalPage from "@/components/legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales relatives à l'éditeur et à l'hébergeur du site ChronoCraft.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      subtitle="Conformément à la législation en vigueur, vous trouverez ci-dessous les informations relatives à l'éditeur et à l'hébergement de ce site."
      updatedAt="3 juin 2026"
      sections={[
        {
          heading: "Éditeur du site",
          body: (
            <ul className="space-y-1.5">
              <li><span className="text-luxury-muted">Dénomination :</span> ChronoCraft</li>
              <li><span className="text-luxury-muted">Forme juridique :</span> Société à responsabilité limitée (SARL)</li>
              <li><span className="text-luxury-muted">Siège social :</span> Casablanca, Maroc</li>
              <li><span className="text-luxury-muted">Téléphone :</span> +212 522 000 000</li>
              <li><span className="text-luxury-muted">E-mail :</span> <span className="text-gold-500">contact@chronocraft.ma</span></li>
            </ul>
          ),
        },
        {
          heading: "Directeur de la publication",
          body: (
            <p>
              Le directeur de la publication est le représentant légal de ChronoCraft. Pour toute demande relative au
              contenu du site, vous pouvez nous écrire à l&apos;adresse <span className="text-gold-500">contact@chronocraft.ma</span>.
            </p>
          ),
        },
        {
          heading: "Hébergement",
          body: (
            <p>
              Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Les
              infrastructures d&apos;hébergement assurent la disponibilité et la sécurité du site.
            </p>
          ),
        },
        {
          heading: "Propriété intellectuelle",
          body: (
            <p>
              L&apos;ensemble des éléments du site (textes, images, logos, charte graphique, marque ChronoCraft) est
              protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation,
              totale ou partielle, sans autorisation écrite préalable, est interdite.
            </p>
          ),
        },
        {
          heading: "Responsabilité",
          body: (
            <p>
              ChronoCraft s&apos;efforce d&apos;assurer l&apos;exactitude des informations diffusées sur le site mais ne
              saurait être tenue responsable des erreurs, omissions ou d&apos;une indisponibilité temporaire du service.
              Les liens vers des sites tiers n&apos;engagent pas la responsabilité de ChronoCraft.
            </p>
          ),
        },
        {
          heading: "Données personnelles",
          body: (
            <p>
              Le traitement de vos données personnelles est détaillé dans notre{" "}
              <a href="/confidentialite" className="text-gold-500 hover:underline">politique de confidentialité</a>.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Pour toute question concernant ces mentions légales, contactez-nous à{" "}
              <span className="text-gold-500">contact@chronocraft.ma</span> ou par téléphone au +212 522 000 000.
            </p>
          ),
        },
      ]}
    />
  );
}
