"use client";

import { useActionState, useState } from "react";
import { submitDepositProofAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import type { DepositMethod } from "@/lib/pricing";
import {
  CheckCircle2, Building2, Store, ShieldCheck, Copy, Check, ListChecks,
} from "lucide-react";

export type ProofMethod = DepositMethod;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-luxury-muted transition-all hover:bg-gold-500/10 hover:text-gold-400 focus:outline-none"
      title="Copier"
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Copié</span></>
      ) : (
        <><Copy className="h-3 w-3" /><span>Copier</span></>
      )}
    </button>
  );
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  BANK_TRANSFER: Building2,
  CASHPLUS: Store,
  WAFACASH: Store,
};

export default function DepositProofForm({
  orderId,
  methods,
  defaultMethod,
}: {
  orderId: string;
  methods: ProofMethod[];
  defaultMethod: ProofMethod["id"];
}) {
  const [method, setMethod] = useState<ProofMethod["id"]>(defaultMethod);
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => submitDepositProofAction(formData),
    null,
  );

  const active = methods.find((m) => m.id === method) ?? methods[0];

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
        <h3 className="font-serif text-lg text-white">Preuve envoyée</h3>
        <p className="mt-2 text-sm text-luxury-muted">
          Votre paiement est en cours de vérification. Vous recevrez une
          notification dès la confirmation de votre commande.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="method" value={method} />

      {/* Method tabs */}
      <div className="flex gap-2">
        {methods.map((m) => {
          const Icon = METHOD_ICONS[m.id] ?? Store;
          const active = m.id === method;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "border-gold-500 bg-gold-500/10 text-gold-400 shadow-[0_0_0_1px_theme(colors.gold.500/30%)]"
                  : "border-luxury-border text-luxury-muted hover:border-gold-500/40 hover:text-luxury-light"
              }`}
            >
              <Icon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Payment card */}
      <div className="overflow-hidden rounded-2xl border border-luxury-border">
        {/* Card header */}
        <div className="relative bg-gradient-to-br from-[#1a1508] via-[#1c1a10] to-[#12100a] px-5 py-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_theme(colors.gold.500/8%),_transparent_60%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-500/70">
                Agent vérifié · Maroc
              </p>
              <p className="mt-0.5 text-base font-bold text-white">{active?.agentName}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[11px] font-semibold text-green-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Vérifié
            </span>
          </div>
        </div>

        {/* Fields grid */}
        {active && active.fields.length > 0 && (
          <div className="divide-y divide-luxury-border border-t border-luxury-border bg-luxury-card/80">
            {active.fields.map((field) => (
              <div
                key={field.label}
                className={`flex items-center justify-between gap-3 px-5 py-3 ${
                  field.wide ? "flex-col items-start" : ""
                }`}
              >
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-luxury-muted">
                  {field.label}
                </span>
                <div className={`flex items-center gap-1 ${field.wide ? "w-full justify-between" : ""}`}>
                  <span className={`font-mono text-sm font-medium text-white ${field.wide ? "break-all" : ""}`}>
                    {field.value}
                  </span>
                  {field.copyable && <CopyButton text={field.value} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {active && active.steps.length > 0 && (
          <div className="border-t border-luxury-border bg-luxury-dark/60 px-5 py-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-luxury-muted">
              <ListChecks className="h-3.5 w-3.5 text-gold-400" /> Étapes
            </p>
            <ol className="space-y-2.5">
              {active.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-luxury-light">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-[11px] font-bold text-gold-400">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {state && !state.success && state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      {/* Reference input */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted">
          {active?.referenceHint ?? "Référence du paiement"}
        </label>
        <input
          name="reference"
          required
          minLength={3}
          placeholder="Ex : TRX-123456"
          className="input-luxury w-full"
        />
      </div>

      {/* Proof URL */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted">
          Lien vers le reçu <span className="normal-case tracking-normal text-luxury-muted/60">(facultatif)</span>
        </label>
        <input
          name="proofUrl"
          type="url"
          placeholder="https://… (capture du reçu)"
          className="input-luxury w-full"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isPending}>
        {isPending ? "Envoi…" : "J'ai payé — envoyer la preuve"}
      </Button>
    </form>
  );
}
