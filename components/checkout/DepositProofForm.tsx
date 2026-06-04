"use client";

import { useActionState, useState, useRef } from "react";
import { submitDepositProofAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import type { DepositMethod } from "@/lib/pricing";
import {
  CheckCircle2, Building2, Store, ShieldCheck, Copy, Check,
  ListChecks, ImageUp, X, FileImage,
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

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif";
const MAX_MB = 5;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
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
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => submitDepositProofAction(formData),
    null,
  );

  const active = methods.find((m) => m.id === method) ?? methods[0];

  function applyFile(file: File) {
    setClientError(null);
    if (!file.type.startsWith("image/")) {
      setClientError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setClientError(`Image trop grande. Maximum ${MAX_MB} Mo.`);
      return;
    }
    setSelectedFile(file);
    // create object URL for preview (revoke previous one)
    if (preview) URL.revokeObjectURL(preview);
    // HEIC/HEIF: no browser preview — show placeholder
    if (file.type === "image/heic" || file.type === "image/heif") {
      setPreview(null);
    } else {
      setPreview(URL.createObjectURL(file));
    }
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setClientError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    applyFile(file);
    // Sync the hidden file input so FormData includes it
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
  }

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-400" />
        <h3 className="font-serif text-lg text-white">Justificatif envoyé</h3>
        <p className="mt-2 text-sm text-luxury-muted">
          Votre photo de reçu est en cours de vérification. Vous recevrez une
          notification dès la confirmation de votre commande.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="method" value={method} />

      {/* Method tabs */}
      <div className="flex gap-2">
        {methods.map((m) => {
          const Icon = METHOD_ICONS[m.id] ?? Store;
          const isActive = m.id === method;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
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

        {active && active.fields.length > 0 && (
          <div className="divide-y divide-luxury-border border-t border-luxury-border bg-luxury-card/80">
            {active.fields.map((field) => (
              <div
                key={field.label}
                className={`flex items-center justify-between gap-3 px-5 py-3 ${field.wide ? "flex-col items-start" : ""}`}
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

      {/* ── Image upload ── */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-luxury-muted">
          Photo du reçu <span className="normal-case font-normal tracking-normal text-luxury-muted/60">(obligatoire)</span>
        </p>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          name="proofImage"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) applyFile(f);
            else clearFile();
          }}
        />

        {selectedFile ? (
          /* ── Preview state ── */
          <div className="relative overflow-hidden rounded-2xl border border-luxury-border bg-luxury-dark">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Aperçu du reçu"
                className="max-h-64 w-full object-contain"
              />
            ) : (
              /* HEIC / no-preview fallback */
              <div className="flex h-32 items-center justify-center gap-3">
                <FileImage className="h-8 w-8 text-gold-500" />
                <p className="text-sm text-luxury-muted">Aperçu non disponible pour ce format</p>
              </div>
            )}
            {/* File info bar */}
            <div className="flex items-center justify-between border-t border-luxury-border px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-luxury-white">{selectedFile.name}</p>
                <p className="text-[11px] text-luxury-muted">{formatBytes(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-luxury-muted transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Supprimer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Dropzone ── */
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
              dragOver
                ? "border-gold-500 bg-gold-500/5"
                : "border-luxury-border hover:border-gold-500/50 hover:bg-luxury-dark/30"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${dragOver ? "bg-gold-500/15" : "bg-luxury-dark"}`}>
              <ImageUp className={`h-5 w-5 ${dragOver ? "text-gold-500" : "text-luxury-muted"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-luxury-white">
                {dragOver ? "Déposez votre photo ici" : "Glissez votre reçu ici"}
              </p>
              <p className="mt-1 text-xs text-luxury-muted">
                ou <span className="text-gold-400 underline underline-offset-2">cliquez pour choisir</span>
              </p>
            </div>
            <p className="text-[11px] text-luxury-muted">JPEG · PNG · WebP · HEIC — max {MAX_MB} Mo</p>
          </button>
        )}

        {/* Client-side validation error */}
        {clientError && (
          <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {clientError}
          </p>
        )}
      </div>

      {/* Server error */}
      {state && !state.success && state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={isPending}
        disabled={!selectedFile || !!clientError || isPending}
      >
        {isPending ? "Envoi en cours…" : "J'ai payé — envoyer le justificatif"}
      </Button>
    </form>
  );
}
