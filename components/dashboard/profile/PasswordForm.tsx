"use client";

import { useState } from "react";
import { ChevronRight, Lock, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { changePasswordAction } from "@/actions/auth";

type ShowState = { current: boolean; next: boolean; confirm: boolean };

export default function PasswordForm() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState<ShowState>({ current: false, next: false, confirm: false });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await changePasswordAction(fd);
    if (result.success) {
      setSuccess(true);
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error);
    }
    setPending(false);
  }

  const fields: { key: keyof ShowState; name: string; label: string; autoComplete: string; minLength?: number }[] = [
    { key: "current", name: "currentPassword", label: "Mot de passe actuel", autoComplete: "current-password", minLength: 1 },
    { key: "next",    name: "newPassword",     label: "Nouveau mot de passe", autoComplete: "new-password",     minLength: 12 },
    { key: "confirm", name: "confirmPassword", label: "Confirmer",            autoComplete: "new-password",     minLength: 12 },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => { setOpen(!open); setError(null); }}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-luxury-dark/50 active:bg-luxury-dark"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
          <Lock className="h-4 w-4 text-gold-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-luxury-white">Modifier le mot de passe</p>
          <p className="text-[11px] text-luxury-muted">
            {success ? "✓ Mot de passe mis à jour avec succès" : "Changer votre mot de passe de connexion"}
          </p>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-luxury-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-luxury-border bg-luxury-dark/30 px-5 py-4 space-y-3"
        >
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-500">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {fields.map(({ key, name, label, autoComplete, minLength }) => (
            <div key={key} className="relative">
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">
                {label}
              </label>
              <input
                name={name}
                required
                type={show[key] ? "text" : "password"}
                minLength={minLength}
                autoComplete={autoComplete}
                className="input-luxury w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                tabIndex={-1}
                className="absolute bottom-2.5 right-3 text-luxury-muted transition-colors hover:text-luxury-white"
              >
                {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          ))}

          <div className="rounded-xl border border-luxury-border bg-luxury-dark px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-luxury-muted">
              12 car. min · 1 majuscule · 1 chiffre · 1 caractère spécial
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Mettre à jour
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
