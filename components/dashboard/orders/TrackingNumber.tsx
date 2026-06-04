"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function TrackingNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center justify-between rounded-xl border border-luxury-border bg-luxury-dark px-4 py-3 transition-all hover:border-gold-500/40 hover:bg-gold-500/5"
    >
      <div className="text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-luxury-muted">
          Numéro de suivi
        </p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-luxury-white">{value}</p>
      </div>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
          copied
            ? "bg-emerald-50 text-emerald-500"
            : "text-luxury-muted group-hover:bg-luxury-border/60 group-hover:text-luxury-white"
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </div>
    </button>
  );
}
