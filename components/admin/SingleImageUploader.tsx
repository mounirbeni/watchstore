"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";

interface SingleImageUploaderProps {
  name: string;
  initialUrl?: string;
  cloudinaryConfigured?: boolean;
  label?: string;
  hint?: string;
}

function isValidUrl(str: string) {
  try { const u = new URL(str); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
}

export default function SingleImageUploader({
  name,
  initialUrl = "",
  cloudinaryConfigured = true,
  label = "Image",
  hint = "JPG, PNG ou WEBP · max 5 MB",
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  async function handleFile(file: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Seuls les formats JPG, PNG et WEBP sont acceptés."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5 MB."); return; }

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/product-images", { method: "POST", body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Échec de l'upload.");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!isValidUrl(trimmed)) { setError("URL invalide."); return; }
    setError(null);
    setUrl(trimmed);
    setUrlInput("");
    setShowUrlInput(false);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />

      {/* Preview */}
      {url ? (
        <div className="relative group w-full aspect-video overflow-hidden rounded-xl border border-luxury-border bg-luxury-dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className="w-full aspect-video rounded-xl border-2 border-dashed border-luxury-border bg-luxury-dark/40 flex flex-col items-center justify-center gap-3 text-luxury-muted"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
        >
          {uploading ? (
            <><Loader2 className="h-6 w-6 animate-spin text-gold-500" /><p className="text-xs">Upload en cours…</p></>
          ) : (
            <><Upload className="h-6 w-6" /><p className="text-sm font-medium">{label}</p><p className="text-xs">{hint}</p></>
          )}
        </div>
      )}

      {!url && !uploading && (
        <div className="flex gap-2 flex-wrap">
          {cloudinaryConfigured && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = ""; }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 text-black text-xs font-semibold hover:bg-gold-400 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Choisir un fichier
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-luxury-border text-luxury-muted text-xs font-medium hover:text-luxury-white transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" /> Ajouter par URL
          </button>
        </div>
      )}

      {url && !uploading && (
        <div className="flex gap-2">
          {cloudinaryConfigured && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = ""; }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-luxury-border text-luxury-muted text-xs font-medium hover:text-luxury-white transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Changer l&apos;image
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-luxury-border text-luxury-muted text-xs font-medium hover:text-luxury-white transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" /> URL
          </button>
        </div>
      )}

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyUrl(); } }}
            placeholder="https://…"
            className="input-luxury flex-1 text-sm"
            autoFocus
          />
          <button type="button" onClick={applyUrl} className="px-3 py-2 rounded-lg bg-gold-500 text-black text-xs font-semibold hover:bg-gold-400 transition-colors">OK</button>
          <button type="button" onClick={() => { setShowUrlInput(false); setUrlInput(""); }} className="px-3 py-2 rounded-lg border border-luxury-border text-luxury-muted text-xs hover:text-luxury-white transition-colors">✕</button>
        </div>
      )}

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
    </div>
  );
}
