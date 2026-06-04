"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Truck, CalendarClock, Package, Mail, Bell } from "lucide-react";

const STORAGE_KEY = "cc_notif_prefs_v1";

const ITEMS = [
  {
    key: "orders",
    label: "Commandes",
    desc: "Confirmations et mises à jour de vos commandes",
    Icon: ShoppingBag,
    on: true,
  },
  {
    key: "shipping",
    label: "Livraison",
    desc: "Suivi et alertes de livraison",
    Icon: Truck,
    on: true,
  },
  {
    key: "reservations",
    label: "Réservations",
    desc: "Statut et expirations de réservations",
    Icon: CalendarClock,
    on: true,
  },
  {
    key: "stock",
    label: "Alertes de stock",
    desc: "Retours en stock de vos montres sauvegardées",
    Icon: Package,
    on: false,
  },
  {
    key: "promo",
    label: "Emails promotionnels",
    desc: "Offres spéciales, ventes privées et nouveautés",
    Icon: Mail,
    on: false,
  },
] as const;

type PrefKey = (typeof ITEMS)[number]["key"];

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>(
    () => Object.fromEntries(ITEMS.map((i) => [i.key, i.on])) as Record<PrefKey, boolean>
  );
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, []);

  function toggle(key: PrefKey) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
      return next;
    });
  }

  return (
    <div className="divide-y divide-luxury-border">
      {ITEMS.map(({ key, label, desc, Icon }) => (
        <div key={key} className="flex items-center gap-3 px-5 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
            <Icon className="h-4 w-4 text-gold-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-luxury-white">{label}</p>
            <p className="text-[11px] text-luxury-muted">{desc}</p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => toggle(key)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
              prefs[key] ? "bg-gold-500" : "bg-luxury-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                prefs[key] ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}

      <div className={`px-5 py-3 transition-opacity duration-300 ${flash ? "opacity-100" : "opacity-0"}`}>
        <p className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Bell className="h-3 w-3" />
          Préférences enregistrées
        </p>
      </div>
    </div>
  );
}
