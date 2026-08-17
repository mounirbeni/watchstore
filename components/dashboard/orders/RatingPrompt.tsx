"use client";

import { useActionState, useEffect, useState } from "react";
import { submitOrderRatingAction } from "@/actions/orders";
import { Star, X, Heart, Sparkles } from "lucide-react";

const STORAGE_PREFIX = "chronocraft:rated:";

const MOOD: Record<number, string> = {
  1: "Nous sommes désolés",
  2: "Nous pouvons mieux faire",
  3: "Merci pour votre retour",
  4: "Ravi qu'elle vous plaise",
  5: "Un choix d'exception",
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <Star
            className={`h-9 w-9 transition-colors duration-150 ${
              n <= shown ? "fill-gold-500 text-gold-500" : "text-luxury-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function RatingPrompt({
  orderId,
  existingRating,
}: {
  orderId: string;
  existingRating: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingRating ?? 0);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => submitOrderRatingAction(formData),
    null,
  );

  const done = Boolean(existingRating) || Boolean(state?.success);

  // Offer the dialog once per order, then leave the customer alone.
  useEffect(() => {
    if (done) return;
    const key = `${STORAGE_PREFIX}${orderId}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    const timer = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(timer);
  }, [orderId, done]);

  // Close on Escape, and keep the page behind from scrolling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => setOpen(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  const score = existingRating ?? rating;

  return (
    <>
      {/* Trigger card */}
      <div className="overflow-hidden rounded-2xl border border-luxury-border bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-luxury-border px-5 py-4">
          <Sparkles className="h-[15px] w-[15px] text-gold-500" />
          <h2 className="font-serif text-base font-semibold text-luxury-white">
            Votre avis
          </h2>
        </div>
        <div className="p-5">
          {done ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
                <Heart className="h-4 w-4 fill-gold-500 text-gold-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-luxury-white">Merci pour votre retour</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${
                        n <= score ? "fill-gold-500 text-gold-500" : "text-luxury-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-luxury-muted">
                Comment trouvez-vous votre montre&nbsp;? Votre retour nous aide à mieux
                vous servir.
              </p>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold-500/40 bg-gold-500/5 text-sm font-semibold text-gold-600 transition-colors hover:bg-gold-500/10"
              >
                <Star className="h-4 w-4" />
                Noter ma montre
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-title"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Capped and scrollable so a short viewport never hides the actions */}
          <div className="max-h-[85vh] w-full max-w-md animate-fade-in overflow-y-auto overscroll-contain rounded-3xl border border-luxury-border bg-white shadow-2xl">
            {state?.success ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/10">
                  <Heart className="h-6 w-6 fill-gold-500 text-gold-500" />
                </div>
                <h3 className="font-serif text-xl text-luxury-white">Merci infiniment</h3>
                <p className="mt-2 text-sm text-luxury-muted">
                  Votre retour a bien été enregistré.
                </p>
              </div>
            ) : (
              <form action={formAction}>
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="rating" value={rating} />

                <div className="flex items-start justify-between gap-3 px-6 pt-6">
                  <div>
                    <h3 id="rating-title" className="font-serif text-xl text-luxury-white">
                      Votre montre vous plaît&nbsp;?
                    </h3>
                    <p className="mt-1 text-sm text-luxury-muted">
                      Un geste rapide, rien qu&apos;entre nous.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                    className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-luxury-muted transition-colors hover:bg-luxury-dark hover:text-luxury-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="px-6 py-7">
                  <Stars value={rating} onChange={setRating} />
                  <p className="mt-3 min-h-[20px] text-center text-sm font-medium text-gold-600">
                    {rating > 0 ? MOOD[rating] : " "}
                  </p>

                  <textarea
                    name="review"
                    rows={3}
                    maxLength={2000}
                    placeholder="Un mot à ajouter&nbsp;? (facultatif)"
                    className="input-luxury mt-4 w-full resize-none"
                  />

                  {state && !state.success && state.error && (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                      {state.error}
                    </p>
                  )}
                </div>

                <div className="sticky bottom-0 flex gap-3 border-t border-luxury-border bg-white px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11 flex-1 rounded-xl border border-luxury-border text-sm font-medium text-luxury-muted transition-colors hover:text-luxury-white"
                  >
                    Plus tard
                  </button>
                  <button
                    type="submit"
                    disabled={rating === 0 || isPending}
                    className="h-11 flex-[1.4] rounded-xl bg-gold-500 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Envoi…" : "Envoyer mon avis"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
