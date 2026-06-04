"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application render error", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-luxury-black px-4 py-16 text-luxury-white">
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-400">ChronoCraft</p>
        <h1 className="mt-4 text-3xl font-serif font-semibold text-white">Service momentanement indisponible</h1>
        <p className="mt-4 text-sm leading-6 text-luxury-muted">
          Une erreur serveur a interrompu le chargement. Vous pouvez reessayer ou revenir a la collection.
        </p>
        {error.digest && <p className="mt-3 text-xs text-luxury-muted">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-gold-400"
          >
            Reessayer
          </button>
          <Link
            href="/shop"
            className="rounded-xl border border-gold-500/40 px-5 py-3 text-sm font-semibold text-gold-400 transition hover:bg-gold-500/10"
          >
            Voir la collection
          </Link>
        </div>
      </section>
    </main>
  );
}
