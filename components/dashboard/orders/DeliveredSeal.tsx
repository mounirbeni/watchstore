"use client";

import { useEffect, useState } from "react";
import { Check, PackageCheck } from "lucide-react";

/** Grace period before a delivery is presented as settled. */
export const SETTLE_MS = 5 * 60 * 1000;

/**
 * The final timeline dot. A delivery reads as "just landed" for five minutes —
 * the window in which a customer would notice something wrong — and only then
 * seals into a confirmed check.
 *
 * `initiallySettled` is computed on the server so the first client render
 * matches the markup it hydrates; the timer only handles the live flip.
 */
export default function DeliveredSeal({
  deliveredAt,
  initiallySettled,
}: {
  deliveredAt: string;
  initiallySettled: boolean;
}) {
  const [settled, setSettled] = useState(initiallySettled);

  useEffect(() => {
    if (settled) return;
    const elapsed = Date.now() - new Date(deliveredAt).getTime();
    const remaining = Math.max(0, SETTLE_MS - elapsed);
    const timer = setTimeout(() => setSettled(true), remaining);
    return () => clearTimeout(timer);
  }, [deliveredAt, settled]);

  if (!settled) {
    return (
      <div className="relative z-10 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gold-500 bg-gold-500/15 text-gold-500">
          <PackageCheck className="h-3.5 w-3.5" />
        </div>
        <span className="absolute inset-0 rounded-full bg-gold-500/25 animate-ping" />
      </div>
    );
  }

  return (
    <div className="relative z-10 shrink-0">
      <div className="flex h-8 w-8 animate-fade-in items-center justify-center rounded-full bg-gold-500 text-black shadow-[0_0_0_4px_theme(colors.gold.500/15%)]">
        <Check className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
