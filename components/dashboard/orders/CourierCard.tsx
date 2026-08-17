import { Phone, BadgeCheck, Truck } from "lucide-react";

/** "Youssef El Amrani" → "YE" — a quiet stand-in for a driver photo we never have. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

/** Strip spacing so tel: links dial correctly while the label stays readable. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function CourierCard({
  carrierName,
  courierName,
  courierPhone,
}: {
  carrierName: string | null;
  courierName: string | null;
  courierPhone: string | null;
}) {
  if (!carrierName && !courierName && !courierPhone) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gold-500/20 bg-gradient-to-r from-gold-500/10 to-transparent px-5 py-4">
        <Truck className="h-[15px] w-[15px] text-gold-500" />
        <h2 className="font-serif text-base font-semibold text-luxury-white">
          Votre livreur
        </h2>
        <span className="ml-auto flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          En route
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-4">
          {/* Monogram */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 ring-1 ring-inset ring-gold-500/25">
            <span className="font-serif text-lg font-semibold text-gold-500">
              {initials(courierName ?? carrierName ?? "?")}
            </span>
            <BadgeCheck className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white text-gold-500" />
          </div>

          <div className="min-w-0 flex-1">
            {courierName && (
              <p className="truncate text-base font-semibold leading-tight text-luxury-white">
                {courierName}
              </p>
            )}
            {carrierName && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
                {carrierName}
              </p>
            )}
          </div>
        </div>

        {courierPhone && (
          <>
            {/* Number, readable and copy-friendly */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-luxury-border bg-luxury-dark/30 px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-luxury-muted">
                Téléphone
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-luxury-white">
                {courierPhone}
              </span>
            </div>

            <a
              href={telHref(courierPhone)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold-500 text-sm font-semibold text-black transition-colors hover:bg-gold-400 active:scale-[0.99]"
            >
              <Phone className="h-4 w-4" />
              Appeler le livreur
            </a>
          </>
        )}

        <p className="mt-3 text-center text-[11px] leading-relaxed text-luxury-muted">
          Gardez votre téléphone à portée — le livreur vous contactera à
          l&apos;approche.
        </p>
      </div>
    </div>
  );
}
