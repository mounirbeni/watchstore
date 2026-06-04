"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const INTERVAL_MS = 60_000;

export default function TrackingRefresher({ active }: { active: boolean }) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function doRefresh() {
    setSpinning(true);
    router.refresh();
    setLastRefresh(new Date());
    setTimeout(() => setSpinning(false), 800);
  }

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(doRefresh, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  return (
    <div className="flex items-center justify-between text-[11px] text-luxury-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Mise à jour automatique
      </span>
      <button
        type="button"
        onClick={doRefresh}
        className="flex items-center gap-1 transition-colors hover:text-luxury-white"
      >
        <RefreshCw className={`h-3 w-3 ${spinning ? "animate-spin" : ""}`} />
        {lastRefresh
          ? `Actualisé à ${lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
          : "Actualiser"}
      </button>
    </div>
  );
}
