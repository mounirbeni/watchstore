"use client";

import { useActionState, useState, useRef } from "react";
import { submitDepositProofAction } from "@/actions/orders";
import Button from "@/components/ui/Button";
import type { DepositMethod } from "@/lib/pricing";
import {
  CheckCircle2, Building2, Store, ShieldCheck, Copy, Check,
  ImageUp, X, FileImage,
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

/** Cap on the original picked file — a sanity check, not the upload budget. */
const MAX_SOURCE_MB = 20;
/** Cap on what actually gets uploaded, after downscaling. */
const MAX_UPLOAD_MB = 4;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Downscale a receipt photo before it goes over the wire. A modern phone
 * camera produces 4–12 MB files, which blow past the Server Action body
 * limit; a legible receipt needs nothing close to that.
 *
 * Returns the original file untouched when the browser cannot decode it
 * (HEIC outside Safari), leaving the size checks to catch the rest.
 */
async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  // Re-encoding can lose to an already-small original; keep whichever wins.
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
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
  const [compressing, setCompressing] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => submitDepositProofAction(formData),
    null,
  );

  const active = methods.find((m) => m.id === method) ?? methods[0];

  /** Push the file the server should actually receive into the form input. */
  function syncInput(file: File) {
    if (!fileRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    fileRef.current.files = dt.files;
  }

  async function applyFile(file: File) {
    setClientError(null);
    if (!file.type.startsWith("image/")) {
      setClientError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
      setClientError(`Image trop grande. Maximum ${MAX_SOURCE_MB} Mo.`);
      return;
    }

    setCompressing(true);
    const optimised = await compressImage(file).catch(() => file);
    setCompressing(false);

    if (optimised.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setClientError(
        `Image trop lourde après optimisation (${formatBytes(optimised.size)}). ` +
          "Essayez une photo de moindre résolution.",
      );
      return;
    }

    setSelectedFile(optimised);
    syncInput(optimised);

    // create object URL for preview (revoke previous one)
    if (preview) URL.revokeObjectURL(preview);
    // HEIC/HEIF that survived uncompressed: no browser preview — show placeholder
    if (optimised.type === "image/heic" || optimised.type === "image/heif") {
      setPreview(null);
    } else {
      setPreview(URL.createObjectURL(optimised));
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
    void applyFile(file);
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
      <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
        {/* Verified agent header */}
        <div className="flex items-center justify-between border-b border-luxury-border px-5 py-4">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = METHOD_ICONS[method] ?? Store;
              return (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
                  <Icon className="h-4 w-4 text-gold-500" />
                </div>
              );
            })()}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
                Agent vérifié · Maroc
              </p>
              <p className="text-sm font-bold text-luxury-white">{active?.agentName}</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-500">
            <ShieldCheck className="h-3 w-3" />
            Vérifié
          </span>
        </div>

        {active && active.fields.length > 0 && (
          <div className="divide-y divide-luxury-border">
            {active.fields.map((field) => (
              <div
                key={field.label}
                className={`flex items-center gap-3 px-5 py-3 ${field.wide ? "flex-col items-start" : "justify-between"}`}
              >
                <span className="shrink-0 text-xs text-luxury-muted">{field.label}</span>
                <div className={`flex items-center gap-1 ${field.wide ? "w-full justify-between" : ""}`}>
                  <span className={`font-mono text-sm font-semibold text-luxury-white ${field.wide ? "break-all" : ""}`}>
                    {field.value}
                  </span>
                  {field.copyable && <CopyButton text={field.value} />}
                </div>
              </div>
            ))}
          </div>
        )}

        {active && active.steps.length > 0 && (
          <div className="border-t border-luxury-border px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
              Instructions
            </p>
            <ol className="space-y-2.5">
              {active.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-luxury-light">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-[11px] font-bold text-gold-500">
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
            if (f) void applyFile(f);
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
            <p className="text-[11px] text-luxury-muted">
              {compressing ? "Optimisation de l'image…" : `JPEG · PNG · WebP · HEIC — max ${MAX_SOURCE_MB} Mo`}
            </p>
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
        loading={isPending || compressing}
        disabled={!selectedFile || !!clientError || isPending || compressing}
      >
        {compressing
          ? "Optimisation…"
          : isPending
            ? "Envoi en cours…"
            : "J'ai payé — envoyer le justificatif"}
      </Button>
    </form>
  );
}
