"use client";

import { useState } from "react";
import { Monitor, Smartphone, Loader2, LogOut, Check } from "lucide-react";
import { revokeOtherSessionsAction } from "@/actions/profile";

interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  revokedAt: Date | null;
  expiresAt: Date;
}

function parseDevice(ua: string | null): { label: string; mobile: boolean } {
  if (!ua) return { label: "Appareil inconnu", mobile: false };
  const mobile = /iPhone|Android|iPad|Mobile/i.test(ua);
  const browser =
    ua.includes("Edg") ? "Edge" :
    ua.includes("Chrome") ? "Chrome" :
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Safari") ? "Safari" :
    "Navigateur";
  const os =
    ua.includes("Windows") ? "Windows" :
    ua.includes("Mac OS") ? "macOS" :
    ua.includes("iPhone") ? "iPhone" :
    ua.includes("Android") ? "Android" :
    ua.includes("Linux") ? "Linux" : "";
  return { label: os ? `${browser} · ${os}` : browser, mobile };
}

export default function SessionsPanel({
  sessions,
  currentToken,
}: {
  sessions: Session[];
  currentToken: string;
}) {
  const [revoking, setRevoking] = useState(false);
  const [done, setDone] = useState(false);

  async function revokeAll() {
    setRevoking(true);
    await revokeOtherSessionsAction();
    setDone(true);
    setRevoking(false);
  }

  const now = new Date();
  const sorted = [...sessions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const hasOtherActive = sorted.some(
    (s) => s.id !== currentToken && !s.revokedAt && s.expiresAt > now
  );

  return (
    <div className="divide-y divide-luxury-border">
      {sorted.slice(0, 6).map((s) => {
        const { label, mobile } = parseDevice(s.userAgent);
        const isActive = !s.revokedAt && s.expiresAt > now;
        const isCurrent = s.id === currentToken;

        return (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                isCurrent ? "bg-gold-500/15" :
                isActive ? "bg-emerald-50" :
                "bg-luxury-dark"
              }`}
            >
              {mobile ? (
                <Smartphone
                  className={`h-4 w-4 ${isCurrent ? "text-gold-500" : isActive ? "text-emerald-500" : "text-luxury-muted"}`}
                />
              ) : (
                <Monitor
                  className={`h-4 w-4 ${isCurrent ? "text-gold-500" : isActive ? "text-emerald-500" : "text-luxury-muted"}`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-luxury-white">{label}</p>
              <p className="text-[11px] text-luxury-muted">
                {s.ipAddress ? `${s.ipAddress} · ` : ""}
                {s.createdAt.toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isCurrent ? "bg-gold-500/15 text-gold-500" :
                isActive ? "bg-emerald-50 text-emerald-600" :
                "bg-luxury-dark text-luxury-muted"
              }`}
            >
              {isCurrent ? "Actuelle" : isActive ? "Active" : s.revokedAt ? "Révoquée" : "Expirée"}
            </span>
          </div>
        );
      })}

      {/* Revoke others */}
      <div className="px-5 py-3.5">
        {done ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" />
            Toutes les autres sessions ont été révoquées.
          </div>
        ) : (
          <button
            type="button"
            onClick={revokeAll}
            disabled={revoking || !hasOtherActive}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {revoking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Déconnecter les autres appareils
          </button>
        )}
      </div>
    </div>
  );
}
