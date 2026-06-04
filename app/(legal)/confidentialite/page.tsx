import LegalPage from "@/components/legal/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment ChronoCraft collecte, utilise et protège vos données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      subtitle="Chez ChronoCraft, la protection de vos données personnelles est une priorité. Cette politique explique quelles informations nous collectons et comment nous les utilisons."
      updatedAt="3 juin 2026"
      sections={[
        {
          heading: "Responsable du traitement",
          body: (
            <p>
              Les données personnelles collectées sur ce site sont traitées par ChronoCraft, dont le siège est situé à
              Casablanca, Maroc. Pour toute question relative à vos données, vous pouvez nous contacter à l&apos;adresse{" "}
              <span className="text-gold-500">contact@chronocraft.ma</span>.
            </p>
          ),
        },
        {
          heading: "Données que nous collectons",
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Informations d&apos;identité : nom, prénom, adresse e-mail, numéro de téléphone.</li>
              <li>Informations de livraison : adresse postale, ville, code postal.</li>
              <li>Informations de commande : articles commandés, montants, historique d&apos;achat.</li>
              <li>Données techniques : adresse IP, type de navigateur, à des fins de sécurité et de prévention de la fraude.</li>
            </ul>
          ),
        },
        {
          heading: "Finalités du traitement",
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Traiter et livrer vos commandes.</li>
              <li>Gérer votre compte client et vous offrir un service après-vente.</li>
              <li>Vous envoyer des notifications relatives à vos commandes.</li>
              <li>Prévenir la fraude et sécuriser les transactions.</li>
              <li>Améliorer nos produits et l&apos;expérience sur le site.</li>
            </ul>
          ),
        },
        {
          heading: "Partage des données",
          body: (
            <p>
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec nos
              prestataires de livraison et de paiement, dans la stricte mesure nécessaire à l&apos;exécution de votre
              commande, et avec les autorités compétentes lorsque la loi l&apos;exige.
            </p>
          ),
        },
        {
          heading: "Conservation des données",
          body: (
            <p>
              Vos données sont conservées pendant la durée nécessaire à la gestion de votre relation commerciale, puis
              archivées conformément aux obligations légales en vigueur au Maroc, notamment en matière comptable et
              fiscale.
            </p>
          ),
        },
        {
          heading: "Vos droits",
          body: (
            <p>
              Conformément à la loi n° 09-08 relative à la protection des personnes physiques à l&apos;égard du traitement
              des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;opposition et de suppression de vos données. Pour exercer ces droits, écrivez-nous à{" "}
              <span className="text-gold-500">contact@chronocraft.ma</span>.
            </p>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              Notre site utilise des cookies essentiels au fonctionnement (session de connexion, panier) ainsi que des
              cookies de mesure d&apos;audience. Vous pouvez configurer votre navigateur pour refuser les cookies, mais
              certaines fonctionnalités du site pourraient ne plus être disponibles.
            </p>
          ),
        },
      ]}
    />
  );
}
