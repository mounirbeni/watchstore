/**
 * Central pricing + deposit policy for the store.
 *
 * Business rules (affordable watches & accessories, conversion-optimised):
 *   Deposit (paid online now, deducted from the total):
 *     subtotal < 300 MAD            -> 30 MAD
 *     300 MAD <= subtotal < 500 MAD -> 50 MAD
 *     subtotal >= 500 MAD           -> 100 MAD
 *   Shipping (paid on delivery, shown in the breakdown):
 *     subtotal < 500 MAD            -> 39 MAD
 *     500 MAD <= subtotal < 800 MAD -> 29 MAD
 *     subtotal >= 800 MAD           -> Free
 *
 * The deposit is always credited toward the order total. The remaining
 * balance is collected on delivery (Cash On Delivery).
 */

export const CURRENCY = "MAD";
export const FREE_SHIPPING_THRESHOLD = 800;

export function depositForSubtotal(subtotal: number): number {
  if (subtotal < 300) return 30;
  if (subtotal < 500) return 50;
  return 100;
}

export function shippingForSubtotal(subtotal: number): number {
  if (subtotal < 500) return 39;
  if (subtotal < 800) return 29;
  return 0;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  deposit: number;
  remaining: number;
  freeShipping: boolean;
  /** MAD left to reach free shipping, 0 once unlocked. */
  freeShippingGap: number;
}

/** Compute the full price breakdown from a product subtotal with optional promo discount. */
export function computePricing(subtotal: number, discount = 0): OrderPricing {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = shippingForSubtotal(discountedSubtotal);
  const total = discountedSubtotal + shipping;
  const deposit = Math.min(depositForSubtotal(discountedSubtotal), total);
  const remaining = Math.max(0, total - deposit);
  return {
    subtotal,
    discount,
    shipping,
    total,
    deposit,
    remaining,
    freeShipping: shipping === 0,
    freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal),
  };
}

// ─── Deposit payment methods (manual verification for Morocco) ────────────────

export type DepositMethodId = "BANK_TRANSFER" | "CASHPLUS" | "WAFACASH";

export interface DepositMethod {
  id: DepositMethodId;
  label: string;
  short: string;
  /** Step-by-step instructions shown after the order is created. */
  instructions: string[];
  referenceHint: string;
}

/**
 * Merchant payment coordinates. Configure via environment variables in
 * production; safe placeholders are used otherwise so the flow never breaks.
 */
const merchant = {
  bankName: process.env["DEPOSIT_BANK_NAME"] ?? "Banque Populaire",
  bankRib: process.env["DEPOSIT_BANK_RIB"] ?? "000 000 0000000000000000 00",
  bankHolder: process.env["DEPOSIT_BANK_HOLDER"] ?? "ChronoCraft SARL",
  cashplusPhone: process.env["DEPOSIT_CASHPLUS_PHONE"] ?? "06 00 00 00 00",
  cashplusName: process.env["DEPOSIT_CASHPLUS_NAME"] ?? "ChronoCraft",
  wafacashPhone: process.env["DEPOSIT_WAFACASH_PHONE"] ?? "06 00 00 00 00",
  wafacashName: process.env["DEPOSIT_WAFACASH_NAME"] ?? "ChronoCraft",
  whatsapp: process.env["DEPOSIT_WHATSAPP"] ?? "06 00 00 00 00",
};

export function getDepositMethods(depositLabel: string): DepositMethod[] {
  return [
    {
      id: "BANK_TRANSFER",
      label: "Virement bancaire",
      short: "RIB · virement ou versement",
      referenceHint: "N° de transaction ou référence du virement",
      instructions: [
        `Effectuez un virement/versement de ${depositLabel} sur le compte ci-dessous.`,
        `Banque : ${merchant.bankName}`,
        `RIB : ${merchant.bankRib}`,
        `Bénéficiaire : ${merchant.bankHolder}`,
        "Indiquez votre numéro de commande dans le motif.",
        "Saisissez ensuite la référence du virement ci-dessous.",
      ],
    },
    {
      id: "CASHPLUS",
      label: "CashPlus",
      short: "Dépôt en agence CashPlus",
      referenceHint: "N° de l'opération CashPlus",
      instructions: [
        `Rendez-vous dans une agence CashPlus et envoyez ${depositLabel}.`,
        `Bénéficiaire : ${merchant.cashplusName}`,
        `Téléphone : ${merchant.cashplusPhone}`,
        "Conservez le reçu, puis saisissez le numéro de l'opération ci-dessous.",
      ],
    },
    {
      id: "WAFACASH",
      label: "Wafacash",
      short: "Dépôt en agence Wafacash",
      referenceHint: "N° de l'opération Wafacash",
      instructions: [
        `Rendez-vous dans une agence Wafacash et envoyez ${depositLabel}.`,
        `Bénéficiaire : ${merchant.wafacashName}`,
        `Téléphone : ${merchant.wafacashPhone}`,
        "Conservez le reçu, puis saisissez le numéro de l'opération ci-dessous.",
      ],
    },
  ];
}

export const merchantContact = { whatsapp: merchant.whatsapp };
