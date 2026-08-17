"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

const STORAGE_PREFIX = "chronocraft:thanked:";

/**
 * A one-time thank-you that greets the customer right after a purchase.
 *
 * Shown once per order number — kept in localStorage so a refresh, a return
 * trip from the bank's app, or a shared link does not replay the celebration.
 */
export default function ThankYouPopup({
  orderNumber,
  customerName,
}: {
  orderNumber: string;
  customerName?: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const key = `${STORAGE_PREFIX}${orderNumber}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");

    const show = setTimeout(() => setVisible(true), 600);
    const hide = setTimeout(() => setLeaving(true), 8000);
    const done = setTimeout(() => setVisible(false), 8400);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(done);
    };
  }, [orderNumber]);

  if (!visible) return null;

  function dismiss() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm transition-all duration-400 sm:bottom-6 sm:right-6 sm:left-auto sm:mx-0 ${
        leaving ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-2xl">
        {/* Gold hairline, the house signature */}
        <div className="h-0.5 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
            <Sparkles className="h-4 w-4 text-gold-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-serif text-[15px] font-semibold leading-tight text-luxury-white">
              Merci{customerName ? `, ${customerName}` : ""} !
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-luxury-muted">
              Votre commande{" "}
              <span className="font-semibold text-luxury-white">{orderNumber}</span>{" "}
              nous est bien parvenue. C&apos;est un plaisir de vous compter parmi
              nos clients.
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Fermer"
            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-luxury-muted transition-colors hover:bg-luxury-dark hover:text-luxury-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
