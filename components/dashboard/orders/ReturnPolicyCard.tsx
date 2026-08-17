"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronDown, RotateCcw, PackageOpen, Wallet } from "lucide-react";

/** Days a customer has to change their mind — mirrors the CGV. */
const RETURN_WINDOW_DAYS = 14;

const CONDITIONS = [
  {
    Icon: PackageOpen,
    title: "Montre non portée",
    body: "Dans son emballage d'origine, avec sa documentation et son certificat de garantie.",
  },
  {
    Icon: RotateCcw,
    title: `${RETURN_WINDOW_DAYS} jours pour décider`,
    body: "Sans avoir à vous justifier. Le délai court à compter de la réception de votre commande.",
  },
  {
    Icon: Wallet,
    title: "Frais de retour",
    body: "À votre charge, sauf erreur de notre part ou défaut constaté — remboursement sous 15 jours.",
  },
  {
    Icon: ShieldCheck,
    title: "Garantie 12 mois",
    body: "Assurée directement par ChronoCraft, au-delà du délai de rétractation.",
  },
];

export default function ReturnPolicyCard({ deliveredAt }: { deliveredAt: Date | null }) {
  const [open, setOpen] = useState(false);

  // A concrete date beats an abstract window — the customer sees their deadline.
  const deadline = deliveredAt
    ? new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
        <ShieldCheck className="h-[15px] w-[15px] text-gold-500" />
        <h2 className="font-serif text-base font-semibold text-luxury-white">
          Satisfait ou remboursé
        </h2>
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed text-luxury-muted">
          Vous disposez de{" "}
          <span className="font-semibold text-luxury-white">
            {RETURN_WINDOW_DAYS} jours
          </span>{" "}
          pour retourner votre montre si elle ne vous convient pas.
        </p>

        {deadline && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-gold-500/25 bg-gold-500/5 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
              Retour possible jusqu&apos;au
            </span>
            <time
              dateTime={deadline.toISOString()}
              className="text-sm font-semibold tabular-nums text-gold-600"
            >
              {deadline.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
        >
          En savoir plus
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="mt-4 animate-fade-in space-y-4 border-t border-luxury-border pt-4">
            {CONDITIONS.map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
                  <Icon className="h-4 w-4 text-gold-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-luxury-white">{title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-luxury-muted">{body}</p>
                </div>
              </div>
            ))}

            <Link
              href="/cgv"
              className="flex h-10 items-center justify-center rounded-xl border border-luxury-border text-sm font-medium text-luxury-muted transition-colors hover:border-gold-500/40 hover:text-gold-600"
            >
              Lire les conditions complètes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
