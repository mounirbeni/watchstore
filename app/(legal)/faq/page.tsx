import Link from "next/link";
import { ChevronLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { CONTACT_PHONE, WHATSAPP_HREF } from "@/lib/contact";

export const metadata: Metadata = { title: "FAQ – ChronoCraft" };

const FAQ_SECTIONS = [
  {
    category: "Commandes & Paiement",
    items: [
      {
        q: "Comment fonctionne le paiement ?",
        a: "Vous versez un acompte en ligne pour confirmer votre réservation : 30 DH en dessous de 300 DH de commande, 50 DH entre 300 et 500 DH, et 100 DH à partir de 500 DH. Il est déduit du total. Le solde restant est réglé en espèces directement au livreur, à la réception de votre colis. Aucune carte bancaire n'est requise pour le paiement final.",
      },
      {
        q: "L'acompte est-il remboursable ?",
        a: "Oui, si votre commande n'est pas confirmée par notre équipe ou si le produit est indisponible, l'acompte vous est intégralement remboursé sous 3 à 5 jours ouvrés.",
      },
      {
        q: "Puis-je utiliser un code promo ?",
        a: "Absolument ! Saisissez votre code promotionnel à l'étape 2 du paiement (\"Récapitulatif de commande\"). La remise sera appliquée automatiquement avant le calcul de l'acompte.",
      },
      {
        q: "Ma commande est-elle confirmée immédiatement ?",
        a: "Non, la confirmation est effectuée par notre équipe après vérification du stock et réception de votre acompte. Vous recevez une notification dès validation, généralement sous 1 à 2 heures.",
      },
      {
        q: "Puis-je annuler ma commande ?",
        a: "Vous pouvez annuler votre commande tant qu'elle n'a pas été expédiée. Contactez-nous par WhatsApp. L'acompte vous sera remboursé intégralement.",
      },
    ],
  },
  {
    category: "Livraison",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "Nous livrons dans tout le Maroc sous 24 à 72 heures après confirmation de votre commande. Les délais peuvent varier légèrement selon votre ville et la disponibilité des transporteurs.",
      },
      {
        q: "Livrez-vous dans toutes les villes du Maroc ?",
        a: "Oui, nous livrons dans tout le Maroc. Si votre localité est difficile d'accès pour nos transporteurs, contactez-nous et nous trouverons un arrangement.",
      },
      {
        q: "Quels sont les frais de livraison ?",
        a: "La livraison est offerte à partir de 800 DH d'achat. En dessous : 29 DH entre 500 et 800 DH, et 39 DH en dessous de 500 DH.",
      },
      {
        q: "Comment suivre ma commande ?",
        a: "Dès l'expédition de votre colis, vous recevez un numéro de suivi par SMS et dans votre espace client. Vous pouvez consulter l'état de votre livraison depuis la section \"Mes commandes\" de votre tableau de bord.",
      },
      {
        q: "Que se passe-t-il si je suis absent à la livraison ?",
        a: "Le livreur tentera une deuxième livraison le lendemain. Après deux tentatives infructueuses, votre colis sera mis en dépôt pendant 5 jours. Passé ce délai, la commande sera annulée.",
      },
    ],
  },
  {
    category: "Produits & Authenticité",
    items: [
      {
        q: "D'où viennent vos montres ?",
        a: "ChronoCraft est une plateforme de distribution : nous ne fabriquons pas nos montres, nous les acquérons auprès de manufactures et de fournisseurs partenaires sélectionnés, avec lesquels nous travaillons dans la durée. Chaque pièce est inspectée avant expédition et livrée avec son certificat de garantie ChronoCraft. Nous ne commercialisons aucune contrefaçon.",
      },
      {
        q: "Comment choisir ma taille de montre ?",
        a: "Chaque fiche produit indique le diamètre du boîtier (en mm) et la longueur du bracelet. Pour un poignet standard, un boîtier de 38 à 42 mm est généralement conseillé. Contactez-nous si vous avez un doute.",
      },
      {
        q: "Les montres sont-elles sous garantie ?",
        a: "Oui. Chaque montre bénéficie de la garantie commerciale ChronoCraft de 12 mois à compter de la livraison, assurée directement par nous : vous n'avez jamais à vous adresser au fournisseur. Elle couvre les défauts de fabrication et de conformité, hors usure normale, choc et pile. Vous conservez par ailleurs la garantie légale contre les vices cachés.",
      },
      {
        q: "Puis-je voir la montre en personne avant d'acheter ?",
        a: "Nous opérons exclusivement en ligne. Cependant, nos photos en haute résolution et nos descriptions détaillées vous donnent une vision complète du produit. En cas de doute, notre équipe peut vous envoyer des photos ou vidéos supplémentaires via WhatsApp.",
      },
    ],
  },
  {
    category: "Retours & Échanges",
    items: [
      {
        q: "Puis-je retourner un article ?",
        a: "Oui. Vous disposez de 14 jours après réception pour retourner un article non porté dans son emballage d'origine, sans avoir à vous justifier. Les frais de retour sont à votre charge sauf en cas de défaut ou d'erreur de notre part. Le remboursement intervient sous 15 jours après réception du retour.",
      },
      {
        q: "Comment initier un retour ?",
        a: "Contactez notre service client via l'espace \"Mes commandes\" ou par WhatsApp en précisant votre numéro de commande et le motif. Notre équipe vous indiquera la marche à suivre sous 48 heures ouvrées. La procédure détaillée figure sur la page Garantie & Retours.",
      },
      {
        q: "Quand serai-je remboursé ?",
        a: "Après réception et vérification du colis retourné, le remboursement est généralement traité sous 5 à 7 jours ouvrés, et dans un délai maximum de 15 jours. Il est effectué par virement bancaire ou en espèces selon votre préférence.",
      },
      {
        q: "Puis-je échanger ma montre contre un autre modèle ?",
        a: "Oui, l'échange est possible dans les 14 jours suivant la réception, sous réserve de disponibilité du modèle souhaité. Si le nouveau modèle est plus cher, vous réglez la différence ; s'il est moins cher, nous vous remboursons la différence.",
      },
    ],
  },
  {
    category: "Compte & Profil",
    items: [
      {
        q: "Est-il obligatoire de créer un compte ?",
        a: "Oui, un compte est nécessaire pour passer commande. Il vous permet de suivre vos commandes, gérer vos favoris, et accéder à votre historique d'achats.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Cliquez sur \"Connexion\" puis sur \"Mot de passe oublié\". Un email de réinitialisation vous sera envoyé à l'adresse associée à votre compte.",
      },
      {
        q: "Comment modifier mes informations personnelles ?",
        a: "Connectez-vous et accédez à votre tableau de bord, puis à \"Paramètres\". Vous pouvez y modifier votre nom, email, numéro de téléphone et adresse de livraison.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-luxury-muted hover:text-luxury-white transition-colors mb-8"
      >
        <ChevronLeft className="h-4 w-4" /> Retour à l&apos;accueil
      </Link>

      {/* Header */}
      <header className="mb-10 pb-8 border-b border-luxury-border">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-gold-500 mb-3">
          Aide & Support
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-luxury-white mb-3">
          Questions fréquentes
        </h1>
        <p className="text-sm sm:text-base text-luxury-muted leading-relaxed">
          Retrouvez ici les réponses aux questions les plus courantes. Si vous ne trouvez pas votre réponse,
          n&apos;hésitez pas à nous contacter directement.
        </p>
      </header>

      {/* FAQ sections */}
      <div className="space-y-10">
        {FAQ_SECTIONS.map(({ category, items }) => (
          <section key={category}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500 mb-4">
              {category}
            </h2>
            <div className="space-y-3">
              {items.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-white border border-luxury-border rounded-xl overflow-hidden shadow-card"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none gap-4">
                    <span className="text-sm font-medium text-luxury-white">{q}</span>
                    <span className="shrink-0 w-5 h-5 rounded-full bg-gold-500/10 text-gold-500 flex items-center justify-center text-xs font-bold group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-luxury-muted leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-14 p-7 bg-white border border-luxury-border rounded-2xl shadow-card text-center">
        <div className="w-11 h-11 rounded-full bg-gold-500/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-5 w-5 text-gold-500" />
        </div>
        <h3 className="text-lg font-serif font-bold text-luxury-white mb-2">
          Vous n&apos;avez pas trouvé votre réponse ?
        </h3>
        <p className="text-sm text-luxury-muted mb-5">
          Notre équipe est disponible du lundi au samedi, de 9h à 18h, pour répondre à toutes vos questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            WhatsApp
          </a>
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-luxury-border text-luxury-light text-sm font-semibold hover:text-luxury-white hover:border-luxury-white transition-colors"
          >
            {CONTACT_PHONE}
          </a>
        </div>
      </div>
    </div>
  );
}
