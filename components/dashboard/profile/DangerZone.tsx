"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2, ChevronDown } from "lucide-react";
import { requestAccountDeletionAction } from "@/actions/profile";

const REASONS = [
  "Je n'utilise plus le service",
  "Je veux créer un nouveau compte",
  "Problèmes de confidentialité",
  "Le service ne répond pas à mes besoins",
  "Autre raison",
];

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = confirmation === "SUPPRIMER";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    const fd = new FormData();
    fd.set("reason", reason);
    await requestAccountDeletionAction(fd);
    setDone(true);
    setPending(false);
  }

  if (done) {
    return (
      <div className="px-5 py-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-700">Demande envoyée</p>
          <p className="mt-1 text-xs text-emerald-600 leading-relaxed">
            Votre demande de suppression a été transmise à notre équipe. Nous vous contacterons par e-mail sous 48h pour confirmer la suppression définitive de votre compte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-red-50/50 active:bg-red-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <Trash2 className="h-4 w-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-500">Supprimer mon compte</p>
            <p className="text-[11px] text-luxury-muted">Action permanente et irréversible</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-luxury-muted" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-600">Suppression définitive du compte</p>
              <p className="mt-1 text-xs leading-relaxed text-red-500">
                Cette action entraîne la perte permanente de toutes vos commandes, réservations, adresses et données personnelles. Elle ne peut pas être annulée.
              </p>
            </div>
          </div>

          {/* Reason select */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">
              Motif (facultatif)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-luxury w-full"
            >
              <option value="">Sélectionner un motif…</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Confirmation input */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">
              Tapez{" "}
              <span className="font-bold text-red-500">SUPPRIMER</span>{" "}
              pour confirmer
            </label>
            <input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              className="input-luxury w-full"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSubmit || pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Envoyer la demande
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setConfirmation(""); setReason(""); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted transition-colors hover:text-luxury-white"
            >
              <X className="h-3.5 w-3.5" />
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
