import LegalPage from "@/components/legal/LegalPage";
import { Wallet, BadgeCheck, Truck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement & Livraison",
  description:
    "Comment fonctionne le paiement chez ChronoCraft : un acompte de 100 DH pour confirmer, puis le solde réglé en espèces à la livraison.",
};

export default function PaiementLivraisonPage() {
  return (
    <LegalPage
      title="Paiement & Livraison"
      subtitle="Le paiement se fait à la livraison (cash). Pour confirmer votre commande, un acompte de 100 DH est réglé à l'avance, puis validé par notre équipe avant la préparation."
      updatedAt="3 juin 2026"
      sections={[
        {
          heading: "Le principe en bref",
          body: (
            <>
              <p>
                Vous ne payez la totalité de votre montre qu&apos;au moment où vous la recevez, en espèces, directement
                au livreur. Pour confirmer votre commande et réserver votre pièce, un acompte de{" "}
                <span className="font-semibold text-gold-500">100 DH</span> est réglé à l&apos;avance. Cet acompte est{" "}
                <span className="text-luxury-white">déduit du montant total</span> : il ne s&apos;ajoute pas au prix.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { Icon: Wallet, title: "1. Acompte de 100 DH", desc: "Réglé en ligne pour confirmer la commande." },
                  { Icon: BadgeCheck, title: "2. Validation admin", desc: "Notre équipe vérifie et confirme votre commande." },
                  { Icon: Truck, title: "3. Solde à la livraison", desc: "Le reste est payé en espèces à la réception." },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-luxury-border bg-white p-4 shadow-card">
                    <Icon className="h-5 w-5 text-gold-500 mb-2" />
                    <p className="text-sm font-semibold text-luxury-white">{title}</p>
                    <p className="text-xs text-luxury-muted mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          ),
        },
        {
          heading: "Pourquoi un acompte ?",
          body: (
            <p>
              L&apos;acompte de 100 DH nous permet de confirmer que votre commande est sérieuse, de réserver la montre à
              votre nom et de la préparer pour l&apos;expédition. Il protège aussi bien le client que le vendeur contre
              les commandes non honorées. Cet acompte est intégralement déduit du prix final de votre commande.
            </p>
          ),
        },
        {
          heading: "Confirmation par l'administrateur",
          body: (
            <p>
              Après le règlement de l&apos;acompte, votre commande passe au statut « en attente de validation ». Notre
              équipe vérifie le paiement de l&apos;acompte, puis confirme la commande. Vous recevez alors une notification
              confirmant que votre montre est en cours de préparation. Aucune commande n&apos;est expédiée avant cette
              confirmation.
            </p>
          ),
        },
        {
          heading: "Comment régler l'acompte",
          body: (
            <>
              <p>L&apos;acompte de 100 DH peut être réglé par l&apos;un des moyens suivants :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><span className="text-luxury-white">Virement bancaire</span> — sur notre RIB communiqué après la commande.</li>
                <li><span className="text-luxury-white">CashPlus</span> — dépôt en agence à notre nom.</li>
                <li><span className="text-luxury-white">Wafacash</span> — dépôt en agence à notre nom.</li>
              </ul>
              <p>
                Les instructions détaillées (coordonnées, référence à indiquer) s&apos;affichent automatiquement après la
                création de votre commande.
              </p>
            </>
          ),
        },
        {
          heading: "Paiement du solde à la livraison",
          body: (
            <p>
              Le reste du montant (prix total − acompte de 100 DH, plus les éventuels frais de livraison) est réglé{" "}
              <span className="text-luxury-white">en espèces, à la livraison</span>, au moment où vous recevez votre
              colis. Vous pouvez vérifier votre montre avant de payer le solde.
            </p>
          ),
        },
        {
          heading: "Frais et délais de livraison",
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Livraison dans tout le Maroc sous 24 à 72 heures après confirmation.</li>
              <li>39 DH pour les commandes inférieures à 500 DH.</li>
              <li>29 DH pour les commandes entre 500 et 800 DH.</li>
              <li>Livraison gratuite à partir de 800 DH.</li>
            </ul>
          ),
        },
        {
          heading: "Remboursement de l'acompte",
          body: (
            <p>
              Si nous ne pouvons pas honorer votre commande (rupture de stock, erreur de prix, etc.), l&apos;acompte vous
              est intégralement remboursé. En cas d&apos;annulation de votre part avant l&apos;expédition, contactez
              notre service client à <span className="text-gold-500">contact@chronocraft.ma</span> pour convenir des
              modalités.
            </p>
          ),
        },
        {
          heading: "Sécurité",
          body: (
            <p className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
              <span>
                Aucun paiement complet en ligne n&apos;est jamais demandé. Vous ne communiquez aucune donnée de carte
                bancaire sur le site : seul l&apos;acompte est réglé à l&apos;avance, et le solde est payé en main propre
                à la livraison.
              </span>
            </p>
          ),
        },
      ]}
    />
  );
}
