import LegalPage from "@/components/legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Les conditions générales de vente applicables aux commandes passées sur ChronoCraft.",
};

export default function CGVPage() {
  return (
    <LegalPage
      title="Conditions Générales de Vente"
      subtitle="Les présentes conditions régissent l'ensemble des ventes conclues sur le site ChronoCraft. Toute commande implique l'acceptation pleine et entière de ces conditions."
      updatedAt="3 juin 2026"
      sections={[
        {
          heading: "Objet",
          body: (
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ChronoCraft
              et toute personne effectuant un achat sur le site. Elles s&apos;appliquent à l&apos;exclusion de toute
              autre condition.
            </p>
          ),
        },
        {
          heading: "Produits",
          body: (
            <p>
              Les montres proposées à la vente sont décrites et présentées avec la plus grande exactitude possible. Les
              photographies sont les plus fidèles possibles mais ne sauraient engager le vendeur en cas de légère
              différence. Chaque pièce est authentique et accompagnée de sa documentation.
            </p>
          ),
        },
        {
          heading: "Prix",
          body: (
            <p>
              Les prix sont indiqués en dirhams marocains (MAD), toutes taxes comprises. ChronoCraft se réserve le droit
              de modifier ses prix à tout moment, étant entendu que le prix figurant au catalogue le jour de la commande
              sera le seul applicable à l&apos;acheteur.
            </p>
          ),
        },
        {
          heading: "Commande et acompte",
          body: (
            <>
              <p>
                Pour confirmer une commande, un acompte est réglé en ligne. Cet acompte est déduit du montant total :
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>30 MAD pour les commandes inférieures à 300 MAD ;</li>
                <li>50 MAD pour les commandes entre 300 et 500 MAD ;</li>
                <li>100 MAD pour les commandes de 500 MAD et plus.</li>
              </ul>
              <p>
                La commande n&apos;est confirmée qu&apos;après validation de l&apos;acompte par notre équipe. Le solde est
                réglé en espèces à la livraison (paiement à la livraison).
              </p>
            </>
          ),
        },
        {
          heading: "Moyens de paiement de l'acompte",
          body: (
            <p>
              L&apos;acompte peut être réglé par virement bancaire, dépôt en agence CashPlus ou Wafacash. Les
              instructions détaillées sont communiquées après la création de la commande. Aucun paiement complet en ligne
              n&apos;est exigé.
            </p>
          ),
        },
        {
          heading: "Livraison",
          body: (
            <>
              <p>
                Nous livrons dans tout le Maroc sous 24 à 72 heures après confirmation de l&apos;acompte. Les frais de
                livraison sont les suivants :
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>39 MAD pour les commandes inférieures à 500 MAD ;</li>
                <li>29 MAD pour les commandes entre 500 et 800 MAD ;</li>
                <li>Livraison gratuite à partir de 800 MAD.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Droit de rétractation et retours",
          body: (
            <p>
              Vous disposez d&apos;un délai de 30 jours à compter de la réception pour retourner un article non porté,
              dans son emballage d&apos;origine et accompagné de sa documentation. Les frais de retour sont à la charge du
              client, sauf en cas d&apos;erreur de notre part ou de produit défectueux.
            </p>
          ),
        },
        {
          heading: "Garantie",
          body: (
            <p>
              Toutes nos montres sont couvertes par la garantie constructeur fournie avec chaque pièce. En cas de
              défaut constaté, contactez notre service client qui vous orientera vers la prise en charge appropriée
              (réparation ou remplacement selon les conditions du constructeur).
            </p>
          ),
        },
        {
          heading: "Codes promotionnels",
          body: (
            <p>
              Les codes promotionnels sont valables selon les conditions propres à chaque offre (montant minimum de
              commande, date d&apos;expiration, nombre d&apos;utilisations). Ils ne sont ni cumulables ni échangeables
              contre des espèces.
            </p>
          ),
        },
        {
          heading: "Litiges",
          body: (
            <p>
              Les présentes CGV sont soumises au droit marocain. En cas de litige, une solution amiable sera recherchée
              avant toute action judiciaire. À défaut, les tribunaux compétents de Casablanca seront seuls compétents.
            </p>
          ),
        },
      ]}
    />
  );
}
