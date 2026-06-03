"use client";

import { useActionState, useState } from "react";
import { submitDepositProofAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import { CheckCircle2, Building2, Store, Info } from "lucide-react";

export interface ProofMethod {
  id: "BANK_TRANSFER" | "CASHPLUS" | "WAFACASH";
  label: string;
  instructions: string[];
  referenceHint: string;
}

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
        <h3 className="font-serif text-lg text-luxury-white">Preuve envoyée</h3>
        <p className="mt-2 text-sm text-luxury-muted">
          Votre paiement est en cours de vérification. Vous recevrez une notification dès la confirmation de votre
          commande.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="method" value={method} />

      {/* Method selector */}
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => {
          const Icon = m.id === "BANK_TRANSFER" ? Building2 : Store;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${
                method === m.id ? "border-gold-500 bg-gold-500/10 text-gold-400" : "border-luxury-border text-luxury-muted hover:text-luxury-light"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-luxury-border bg-luxury-dark/50 p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-luxury-white">
          <Info className="h-4 w-4 text-gold-400" /> Instructions de paiement
        </p>
        <ul className="space-y-1.5 text-sm text-luxury-light">
          {active?.instructions.map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold-400">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {state && !state.success && state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{state.error}</p>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted">
          {active?.referenceHint ?? "Référence du paiement"}
        </label>
        <input name="reference" required minLength={3} placeholder="Ex : TRX-123456" className="input-luxury w-full" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-luxury-muted">
          Lien vers le reçu (facultatif)
        </label>
        <input name="proofUrl" type="url" placeholder="https://… (capture du reçu)" className="input-luxury w-full" />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isPending}>
        {isPending ? "Envoi…" : "J'ai payé — envoyer la preuve"}
      </Button>
    </form>
  );
}
