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

export interface PaymentField {
  label: string;
  value: string;
  copyable?: boolean;
  wide?: boolean;
}

export interface DepositMethod {
  id: DepositMethodId;
  label: string;
  short: string;
  agentName: string;
  fields: PaymentField[];
  steps: string[];
  referenceHint: string;
}

/**
 * Merchant payment coordinates. Configure via environment variables in
 * production; safe placeholders are used otherwise so the flow never breaks.
 */
const merchant = {
  bankName: process.env["DEPOSIT_BANK_NAME"] ?? "CIH Bank",
  bankRib: process.env["DEPOSIT_BANK_RIB"] ?? "230 450 3396820211017700 73",
  bankIban: process.env["DEPOSIT_BANK_IBAN"] ?? "MA64 2304 5033 9682 0211 0177 0073",
  bankSwift: process.env["DEPOSIT_BANK_SWIFT"] ?? "CIHMMAMC",
  bankHolder: process.env["DEPOSIT_BANK_HOLDER"] ?? "Mounir Banni",
  cashplusPhone: process.env["DEPOSIT_CASHPLUS_PHONE"] ?? "+21260439975",
  cashplusName: process.env["DEPOSIT_CASHPLUS_NAME"] ?? "Mounir Banni",
  wafacashPhone: process.env["DEPOSIT_WAFACASH_PHONE"] ?? "+21260439975",
  wafacashName: process.env["DEPOSIT_WAFACASH_NAME"] ?? "Mounir Banni",
  whatsapp: process.env["DEPOSIT_WHATSAPP"] ?? "+21260439975",
};

export function getDepositMethods(depositLabel: string): DepositMethod[] {
  return [
    {
      id: "BANK_TRANSFER",
      label: "Virement bancaire",
      short: "CIH Bank · RIB, IBAN & SWIFT",
      agentName: merchant.bankHolder,
      fields: [
        { label: "Banque", value: merchant.bankName },
        { label: "Titulaire", value: merchant.bankHolder, copyable: true },
        { label: "RIB", value: merchant.bankRib, copyable: true, wide: true },
        { label: "IBAN", value: merchant.bankIban, copyable: true, wide: true },
        { label: "SWIFT / BIC", value: merchant.bankSwift, copyable: true },
      ],
      steps: [
        `Effectuez un virement de ${depositLabel} vers le compte ci-dessous.`,
        "Indiquez votre numéro de commande dans le motif du virement.",
        "Saisissez la référence de la transaction ci-dessous et envoyez la preuve.",
      ],
      referenceHint: "N° de transaction ou référence du virement",
    },
    {
      id: "CASHPLUS",
      label: "CashPlus",
      short: "Envoi via agence CashPlus",
      agentName: merchant.cashplusName,
      fields: [
        { label: "Bénéficiaire", value: merchant.cashplusName, copyable: true },
        { label: "Téléphone", value: merchant.cashplusPhone, copyable: true },
      ],
      steps: [
        `Rendez-vous dans une agence CashPlus et envoyez ${depositLabel}.`,
        "Conservez le reçu de l'opération.",
        "Saisissez le numéro de l'opération ci-dessous et envoyez la preuve.",
      ],
      referenceHint: "N° de l'opération CashPlus",
    },
    {
      id: "WAFACASH",
      label: "Wafacash",
      short: "Envoi via agence Wafacash",
      agentName: merchant.wafacashName,
      fields: [
        { label: "Bénéficiaire", value: merchant.wafacashName, copyable: true },
        { label: "Téléphone", value: merchant.wafacashPhone, copyable: true },
      ],
      steps: [
        `Rendez-vous dans une agence Wafacash et envoyez ${depositLabel}.`,
        "Conservez le reçu de l'opération.",
        "Saisissez le numéro de l'opération ci-dessous et envoyez la preuve.",
      ],
      referenceHint: "N° de l'opération Wafacash",
    },
  ];
}

export const merchantContact = { whatsapp: merchant.whatsapp };
