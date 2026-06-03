import { formatPrice } from "@/lib/utils";
import { Wallet, Truck } from "lucide-react";

interface Props {
  subtotal: number;
  shipping: number;
  total: number;
  deposit: number;
  remaining: number;
  freeShipping?: boolean;
  /** Hide the explanatory note (e.g. when shown next to a confirmed order). */
  hideNote?: boolean;
}

export default function PriceBreakdown({
  subtotal,
  shipping,
  total,
  deposit,
  remaining,
  freeShipping,
  hideNote,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span className="text-luxury-muted">Sous-total</span>
          <span className="text-luxury-light">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-luxury-muted">Livraison</span>
          {freeShipping || shipping === 0 ? (
            <span className="text-green-400">Gratuite</span>
          ) : (
            <span className="text-luxury-light">{formatPrice(shipping)}</span>
          )}
        </div>
        <div className="flex justify-between border-t border-luxury-border pt-2.5">
          <span className="font-medium text-luxury-white">Total de la commande</span>
          <span className="font-semibold text-luxury-white">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Deposit highlight */}
      <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-gold-400">
            <Wallet className="h-4 w-4" /> Acompte à régler maintenant
          </span>
          <span className="text-lg font-bold text-gold-400">{formatPrice(deposit)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-gold-500/20 pt-3">
          <span className="flex items-center gap-2 text-sm text-luxury-light">
            <Truck className="h-4 w-4 text-luxury-muted" /> Reste à payer à la livraison
          </span>
          <span className="font-semibold text-luxury-white">{formatPrice(remaining)}</span>
        </div>
      </div>

      {!hideNote && (
        <p className="text-xs leading-relaxed text-luxury-muted">
          Pour confirmer votre commande, un acompte de{" "}
          <span className="font-medium text-gold-400">{formatPrice(deposit)}</span> est requis. Il est{" "}
          <span className="text-luxury-light">déduit du total</span> : le solde de{" "}
          <span className="font-medium text-luxury-light">{formatPrice(remaining)}</span> est payé en espèces à la
          livraison.
        </p>
      )}
    </div>
  );
}
