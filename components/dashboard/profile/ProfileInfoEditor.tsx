"use client";

import { useState } from "react";
import { ChevronRight, Check, X, Loader2 } from "lucide-react";
import { updateProfileAction } from "@/actions/profile";

type Field = "name" | "phone";

interface Props {
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
}

export default function ProfileInfoEditor({ firstName, lastName, phone, email }: Props) {
  const [editing, setEditing] = useState<Field | null>(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<Field | null>(null);
  const [values, setValues] = useState({ firstName, lastName, phone: phone ?? "" });

  async function save(field: Field) {
    setPending(true);
    const fd = new FormData();
    fd.set("firstName", values.firstName);
    fd.set("lastName", values.lastName);
    fd.set("phone", values.phone);
    await updateProfileAction(fd);
    setSaved(field);
    setTimeout(() => setSaved(null), 3000);
    setPending(false);
    setEditing(null);
  }

  const rows: { key: Field; label: string; value: string; content: React.ReactNode }[] = [
    {
      key: "name",
      label: "Nom complet",
      value: `${values.firstName} ${values.lastName}`,
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">Prénom</label>
            <input
              value={values.firstName}
              onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
              className="input-luxury w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">Nom</label>
            <input
              value={values.lastName}
              onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
              className="input-luxury w-full"
            />
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      value: values.phone || "Non renseigné",
      content: (
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">Numéro de téléphone</label>
          <input
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            placeholder="+212 6XX XXX XXX"
            className="input-luxury w-full"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="divide-y divide-luxury-border">
      {/* E-mail — read only */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">E-mail</p>
          <p className="mt-0.5 truncate text-sm text-luxury-light">{email}</p>
        </div>
        <span className="shrink-0 rounded-full border border-luxury-border px-2 py-0.5 text-[10px] text-luxury-muted">
          Fixe
        </span>
      </div>

      {rows.map(({ key, label, value, content }) => (
        <div key={key}>
          <button
            type="button"
            onClick={() => {
              setEditing(editing === key ? null : key);
            }}
            className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-luxury-dark/50 active:bg-luxury-dark"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">{label}</p>
              <p className="mt-0.5 truncate text-sm text-luxury-white">{value}</p>
            </div>
            {saved === key ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <ChevronRight
                className={`h-4 w-4 shrink-0 text-luxury-muted transition-transform duration-200 ${editing === key ? "rotate-90" : ""}`}
              />
            )}
          </button>

          {editing === key && (
            <div className="border-t border-luxury-border bg-luxury-dark/30 px-5 py-4 space-y-3">
              {content}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => save(key)}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-4 py-2 text-sm text-luxury-muted transition-colors hover:text-luxury-white"
                >
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
