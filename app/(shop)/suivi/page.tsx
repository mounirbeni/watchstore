import type { Metadata } from "next";
import PublicTracking from "@/components/tracking/PublicTracking";

export const metadata: Metadata = {
  title: "Suivre ma commande",
  description:
    "Suivez votre commande ChronoCraft sans compte : entrez votre numéro de commande ou de suivi et le téléphone utilisé lors de l'achat.",
};

export default function SuiviPage() {
  return <PublicTracking />;
}
