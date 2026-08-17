import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import {
  ShieldCheck, RotateCcw, Wrench, PackageOpen, Wallet,
  MessageCircle, Truck, BadgeCheck, CalendarClock, XCircle,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantie & Retours",
  description:
    "Garantie commerciale ChronoCraft de 12 mois et droit de retour de 14 jours : ce qui est couvert, comment faire jouer la garantie et comment retourner une montre.",
};

/** Kept in one place so the page, the CGV and the order card cannot drift apart. */
const WARRANTY_MONTHS = 12;
const RETURN_DAYS = 14;
const REFUND_DAYS = 15;

const COVERED = [
  "Défauts de fabrication du mouvement (montre qui s'arrête, prend ou perd anormalement du temps).",
  "Défauts du boîtier, du cadran, des aiguilles ou du fermoir apparus en usage normal.",
  "Non-conformité de la pièce livrée par rapport à sa description sur le site.",
  "Décollement ou défaillance d'un élément d'assemblage sans cause externe.",
];

const NOT_COVERED = [
  "Usure normale du bracelet, de la lunette, du verre ou du placage.",
  "Rayures, chocs, chutes et tout dommage d'origine externe.",
  "Dégâts liés à l'eau sur une montre non conçue pour l'immersion, ou au-delà de son indice d'étanchéité.",
  "Toute intervention réalisée par un horloger ou un tiers non agréé par ChronoCraft.",
  "La pile, considérée comme un consommable.",
  "La perte et le vol.",
];

const WARRANTY_STEPS = [
  {
    Icon: MessageCircle,
    title: "1. Vous nous écrivez",
    desc: "Depuis « Mes commandes » ou par WhatsApp, avec votre numéro de commande et une photo ou vidéo du défaut.",
  },
  {
    Icon: BadgeCheck,
    title: "2. Nous répondons sous 48h",
    desc: "Notre service après-vente accuse réception et vous indique la marche à suivre.",
  },
  {
    Icon: Wrench,
    title: "3. Prise en charge",
    desc: "Réparation, remplacement ou remboursement selon le défaut constaté — à nos frais.",
  },
];

const RETURN_STEPS = [
  {
    Icon: CalendarClock,
    title: `1. Dans les ${RETURN_DAYS} jours`,
    desc: "Signalez-nous votre retour avant l'expiration du délai, sans avoir à vous justifier.",
  },
  {
    Icon: PackageOpen,
    title: "2. Remballez la montre",
    desc: "Non portée, dans son emballage d'origine, avec sa documentation et son certificat.",
  },
  {
    Icon: Truck,
    title: "3. Expédition",
    desc: "Nous vous communiquons l'adresse de retour et le transporteur à utiliser.",
  },
  {
    Icon: Wallet,
    title: "4. Remboursement",
    desc: `Sous ${REFUND_DAYS} jours maximum après réception et contrôle de la pièce.`,
  },
];

function StepGrid({
  steps,
  columns,
}: {
  steps: { Icon: React.ElementType; title: string; desc: string }[];
  columns: string;
}) {
  return (
    <div className={`mt-4 grid grid-cols-1 gap-3 ${columns}`}>
      {steps.map(({ Icon, title, desc }) => (
        <div key={title} className="rounded-xl border border-luxury-border bg-white p-4 shadow-card">
          <Icon className="mb-2 h-5 w-5 text-gold-500" />
          <p className="text-sm font-semibold text-luxury-white">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-luxury-muted">{desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function GarantieRetoursPage() {
  return (
    <LegalPage
      title="Garantie & Retours"
      subtitle={`Une garantie commerciale de ${WARRANTY_MONTHS} mois que nous assurons nous-mêmes, et ${RETURN_DAYS} jours pour changer d'avis. Voici précisément ce que cela couvre et comment en bénéficier.`}
      updatedAt="17 août 2026"
      sections={[
        {
          heading: "L'essentiel",
          body: (
            <>
              <p>
                ChronoCraft distribue des montres acquises auprès de manufactures et de fournisseurs partenaires. Nous
                ne les fabriquons pas — mais c&apos;est bien{" "}
                <span className="text-luxury-white">ChronoCraft qui porte la garantie</span> : vous n&apos;avez jamais
                à contacter un fournisseur ou une usine, ni à faire valoir vos droits auprès d&apos;un tiers.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { Icon: ShieldCheck, title: `Garantie ${WARRANTY_MONTHS} mois`, desc: "Contre les défauts de fabrication et de conformité." },
                  { Icon: RotateCcw, title: `Retour sous ${RETURN_DAYS} jours`, desc: "Sans motif, à compter de la réception." },
                  { Icon: Wallet, title: `Remboursé sous ${REFUND_DAYS} jours`, desc: "Après réception et contrôle du retour." },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-gold-500/25 bg-gold-500/5 p-4">
                    <Icon className="mb-2 h-5 w-5 text-gold-500" />
                    <p className="text-sm font-semibold text-luxury-white">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-luxury-muted">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          heading: `Garantie commerciale — ${WARRANTY_MONTHS} mois`,
          body: (
            <>
              <p>
                Chaque montre est couverte pendant{" "}
                <span className="text-luxury-white">{WARRANTY_MONTHS} mois à compter de la date de livraison</span>,
                telle qu&apos;elle figure sur le suivi de votre commande. La garantie est attachée à la commande : nul
                besoin de conserver un bon papier, votre historique en ligne fait foi.
              </p>

              <p className="mt-4 flex items-center gap-2 font-semibold text-luxury-white">
                <BadgeCheck className="h-4 w-4 text-gold-500" /> Ce qui est couvert
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                {COVERED.map((item) => <li key={item}>{item}</li>)}
              </ul>

              <p className="mt-4 flex items-center gap-2 font-semibold text-luxury-white">
                <XCircle className="h-4 w-4 text-luxury-muted" /> Ce qui n&apos;est pas couvert
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                {NOT_COVERED.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          ),
        },
        {
          heading: "Faire jouer la garantie",
          body: (
            <>
              <p>
                La procédure est gratuite. Les frais d&apos;expédition liés à une prise en charge sous garantie sont à
                notre charge.
              </p>
              <StepGrid steps={WARRANTY_STEPS} columns="sm:grid-cols-3" />
            </>
          ),
        },
        {
          heading: `Droit de rétractation — ${RETURN_DAYS} jours`,
          body: (
            <>
              <p>
                Vous disposez de{" "}
                <span className="text-luxury-white">{RETURN_DAYS} jours à compter de la réception</span> pour renvoyer
                une montre <span className="text-luxury-white">sans avoir à motiver votre décision</span>. Ce délai est
                volontairement plus long que le minimum de 7 jours fixé par l&apos;article 36 de la loi 31-08 relative
                à la protection du consommateur.
              </p>
              <p>
                La montre doit nous revenir non portée, dans son emballage d&apos;origine et accompagnée de sa
                documentation. Une pièce visiblement portée, rayée ou incomplète peut faire l&apos;objet d&apos;un
                remboursement partiel correspondant à la dépréciation constatée.
              </p>
            </>
          ),
        },
        {
          heading: "Comment retourner une montre",
          body: <StepGrid steps={RETURN_STEPS} columns="sm:grid-cols-2" />,
        },
        {
          heading: "Frais de retour",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <span className="text-luxury-white">Retour à votre initiative</span> (changement d&apos;avis, taille,
                style) : les frais d&apos;expédition retour sont à votre charge.
              </li>
              <li>
                <span className="text-luxury-white">Erreur de notre part, défaut ou non-conformité</span> : les frais
                sont intégralement pris en charge par ChronoCraft, y compris le renvoi de la pièce de remplacement.
              </li>
            </ul>
          ),
        },
        {
          heading: "Échanges",
          body: (
            <p>
              Un échange contre un autre modèle est possible dans le même délai de {RETURN_DAYS} jours, sous réserve de
              disponibilité. La différence de prix est réglée ou remboursée selon le sens de l&apos;échange. Si le
              modèle souhaité est indisponible, l&apos;échange est traité comme un retour classique.
            </p>
          ),
        },
        {
          heading: "Remboursement",
          body: (
            <p>
              Le remboursement intervient dans un délai maximum de{" "}
              <span className="text-luxury-white">{REFUND_DAYS} jours</span> à compter de la réception du retour dans
              nos locaux, après contrôle de l&apos;état de la pièce. Il porte sur le prix du produit et, en cas de
              défaut ou d&apos;erreur de notre part, sur les frais de livraison initiaux. L&apos;acompte versé à la
              commande est inclus dans le montant remboursé.
            </p>
          ),
        },
        {
          heading: "Vos garanties légales",
          body: (
            <>
              <p>
                La garantie commerciale décrite ci-dessus s&apos;ajoute aux protections que la loi vous accorde et ne
                s&apos;y substitue en aucun cas. Vous conservez notamment :
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  la <span className="text-luxury-white">garantie contre les vices cachés</span> des articles 549 et
                  suivants du Dahir formant Code des Obligations et des Contrats ;
                </li>
                <li>
                  les droits ouverts par la{" "}
                  <span className="text-luxury-white">loi n° 31-08</span> édictant des mesures de protection du
                  consommateur.
                </li>
              </ul>
              <p>
                Aucune stipulation de la présente page ne peut avoir pour effet de vous priver de ces garanties, quand
                bien même le délai de {WARRANTY_MONTHS} mois serait expiré.
              </p>
            </>
          ),
        },
        {
          heading: "Nous contacter",
          body: (
            <>
              <p>
                Pour toute demande de garantie, de retour ou d&apos;échange, passez par votre espace{" "}
                <Link href="/dashboard/orders" className="text-gold-500 hover:underline">
                  Mes commandes
                </Link>{" "}
                ou écrivez-nous à <span className="text-gold-500">contact@chronocraft.ma</span>. Nous accusons
                réception de toute réclamation sous 48 heures ouvrées.
              </p>
              <p>
                Les conditions complètes figurent dans nos{" "}
                <Link href="/cgv" className="text-gold-500 hover:underline">
                  Conditions Générales de Vente
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
