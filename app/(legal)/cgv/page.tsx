import Link from "next/link";
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
      updatedAt="17 août 2026"
      sections={[
        {
          heading: "Objet et cadre légal",
          body: (
            <>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
                ChronoCraft et toute personne effectuant un achat sur le site. Elles s&apos;appliquent à
                l&apos;exclusion de toute autre condition.
              </p>
              <p>
                Elles s&apos;inscrivent dans le cadre de la loi n° 31-08 édictant des mesures de protection du
                consommateur, de la loi n° 53-05 relative à l&apos;échange électronique de données juridiques, de la
                loi n° 09-08 relative à la protection des personnes physiques à l&apos;égard du traitement des données
                à caractère personnel, ainsi que du Dahir formant Code des Obligations et des Contrats.
              </p>
            </>
          ),
        },
        {
          heading: "Qualité de ChronoCraft — distributeur",
          body: (
            <>
              <p>
                ChronoCraft est une <span className="text-luxury-white">plateforme de distribution</span> opérant au
                Maroc. Nous ne fabriquons pas les montres que nous vendons : elles sont acquises auprès de fournisseurs
                et de manufactures partenaires avec lesquels nous entretenons des relations contractuelles suivies.
              </p>
              <p>
                ChronoCraft intervient donc en qualité de <span className="text-luxury-white">vendeur professionnel
                et distributeur</span>, et non de fabricant. Cette qualité ne réduit en rien vos droits : c&apos;est
                ChronoCraft, en tant que vendeur, qui répond devant vous de la conformité du produit livré et qui
                assure le service après-vente décrit à l&apos;article suivant.
              </p>
            </>
          ),
        },
        {
          heading: "Sélection des fournisseurs et contrôle qualité",
          body: (
            <>
              <p>
                Nos fournisseurs sont sélectionnés puis suivis dans la durée. Chaque référence fait l&apos;objet
                d&apos;un contrôle avant sa mise en vente et chaque pièce est inspectée avant expédition
                (fonctionnement du mouvement, état esthétique, complétude de la fourniture).
              </p>
              <p>
                ChronoCraft s&apos;interdit la commercialisation de contrefaçons. Les montres vendues sous la marque
                ChronoCraft sont produites par nos manufactures partenaires et ne sont pas présentées comme des
                produits d&apos;une autre marque horlogère.
              </p>
            </>
          ),
        },
        {
          heading: "Produits et descriptions",
          body: (
            <p>
              Les montres proposées à la vente sont décrites et présentées avec la plus grande exactitude possible. Les
              photographies sont les plus fidèles possibles mais ne sauraient engager le vendeur en cas de légère
              différence de teinte ou de rendu liée à l&apos;affichage. Les caractéristiques essentielles de chaque
              pièce sont indiquées sur sa fiche produit, conformément à l&apos;obligation d&apos;information de la loi
              31-08.
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
            <>
              <p>
                Vous disposez d&apos;un délai de{" "}
                <span className="text-luxury-white">14 jours</span> à compter de la réception pour retourner un
                article, sans avoir à motiver votre décision. Ce délai est plus favorable que le minimum de 7 jours
                prévu par l&apos;article 36 de la loi 31-08.
              </p>
              <p>
                L&apos;article doit être retourné non porté, dans son emballage d&apos;origine et accompagné de sa
                documentation. Les frais de retour sont à la charge du client, sauf en cas d&apos;erreur de notre part
                ou de produit défectueux, auquel cas ils sont intégralement pris en charge par ChronoCraft.
              </p>
              <p>
                Le remboursement intervient dans un délai maximum de 15 jours à compter de la réception du retour, par
                le moyen convenu avec vous. La procédure complète est décrite sur la page{" "}
                <Link href="/garantie-retours" className="text-gold-500 hover:underline">
                  Garantie &amp; Retours
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          heading: "Garantie commerciale ChronoCraft — 12 mois",
          body: (
            <>
              <p>
                Chaque montre bénéficie d&apos;une{" "}
                <span className="text-luxury-white">garantie commerciale ChronoCraft de 12 mois</span> à compter de la
                date de livraison. Cette garantie est assurée et prise en charge directement par ChronoCraft, en notre
                qualité de vendeur, sans que vous ayez à vous adresser au fournisseur ou à la manufacture.
              </p>
              <p className="text-luxury-white">Ce que la garantie couvre :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>les défauts de fabrication du mouvement ;</li>
                <li>les défauts affectant le boîtier, le cadran ou le fermoir apparus en usage normal ;</li>
                <li>toute non-conformité de la pièce livrée par rapport à sa description.</li>
              </ul>
              <p className="text-luxury-white">Ce que la garantie ne couvre pas :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>l&apos;usure normale du bracelet, de la lunette ou du verre ;</li>
                <li>les dommages résultant d&apos;un choc, d&apos;une chute ou d&apos;un usage inapproprié ;</li>
                <li>les dégâts liés à l&apos;eau sur une montre non conçue pour l&apos;immersion ;</li>
                <li>toute intervention réalisée par un tiers non agréé par ChronoCraft ;</li>
                <li>la pile, considérée comme consommable.</li>
              </ul>
              <p>
                La mise en œuvre s&apos;effectue par simple demande auprès de notre service client. Selon le cas, la
                pièce est réparée, remplacée ou remboursée. Le détail de la procédure figure sur la page{" "}
                <Link href="/garantie-retours" className="text-gold-500 hover:underline">
                  Garantie &amp; Retours
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          heading: "Garanties légales",
          body: (
            <p>
              Indépendamment de la garantie commerciale ci-dessus, vous bénéficiez en tout état de cause de la garantie
              légale contre les vices cachés prévue par les articles 549 et suivants du Dahir formant Code des
              Obligations et des Contrats, ainsi que des protections édictées par la loi 31-08. Aucune clause des
              présentes CGV ne peut avoir pour effet de vous priver de ces garanties.
            </p>
          ),
        },
        {
          heading: "Service après-vente",
          body: (
            <p>
              Le service après-vente est assuré par ChronoCraft, joignable via les coordonnées figurant aux mentions
              légales. Il traite les demandes de garantie, de réparation, de retour et de réclamation. Nous nous
              engageons à accuser réception de toute réclamation sous 48 heures ouvrées et à la traiter dans les
              meilleurs délais.
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
          heading: "Données personnelles",
          body: (
            <p>
              Les données collectées lors de la commande sont traitées conformément à la loi 09-08 et à notre politique
              de confidentialité. Elles sont utilisées pour le traitement de votre commande, la livraison et le service
              après-vente, et ne sont jamais cédées à des tiers à des fins commerciales. Vous disposez d&apos;un droit
              d&apos;accès, de rectification et d&apos;opposition que vous pouvez exercer à tout moment.
            </p>
          ),
        },
        {
          heading: "Réclamations et litiges",
          body: (
            <>
              <p>
                Les présentes CGV sont soumises au droit marocain. Toute réclamation doit d&apos;abord être adressée à
                notre service client, qui dispose d&apos;un délai raisonnable pour y répondre.
              </p>
              <p>
                À défaut de solution amiable, le litige peut être porté devant les juridictions compétentes. Le
                consommateur conserve la faculté de saisir la juridiction de son lieu de domicile, conformément aux
                dispositions protectrices de la loi 31-08.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
