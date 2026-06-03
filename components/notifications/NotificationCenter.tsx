"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, Search, Trash2, CheckCheck } from "lucide-react";
import {
  markAllNotificationsReadAction, markNotificationReadAction,
  deleteNotificationAction, clearAllNotificationsAction,
} from "@/actions/notifications";
import { CATEGORY_META, CATEGORIES, PRIORITY_ACCENT, timeAgoShort, type NotificationDTO } from "./meta";

const POLL_MS = 30_000;

export default function NotificationCenter() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [category, setCategory] = useState("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (category !== "ALL") params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    try {
      const res = await fetch(`/api/notifications?${params}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items);
      setUnread(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [category, q]);

  useEffect(() => {
    const t = setTimeout(refresh, q ? 250 : 0); // debounce search
    return () => clearTimeout(t);
  }, [refresh, q]);

  useEffect(() => {
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  async function markOne(n: NotificationDTO) {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    await markNotificationReadAction(n.id);
  }
  async function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
    await deleteNotificationAction(id);
    refresh();
  }
  async function markAll() {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    await markAllNotificationsReadAction();
  }
  async function clearAll() {
    setItems([]);
    setUnread(0);
    await clearAllNotificationsAction();
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-luxury-muted" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…"
            className="input-luxury w-full pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={markAll} disabled={unread === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-3 py-2 text-sm text-luxury-light transition-colors hover:text-luxury-white disabled:opacity-40">
            <CheckCheck className="h-4 w-4" /> Tout lu
          </button>
          <button onClick={clearAll} disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-luxury-border px-3 py-2 text-sm text-luxury-muted transition-colors hover:text-red-400 disabled:opacity-40">
            <Trash2 className="h-4 w-4" /> Effacer
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {["ALL", ...CATEGORIES].map((c) => {
          const active = category === c;
          const label = c === "ALL" ? "Toutes" : CATEGORY_META[c]?.label ?? c;
          return (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                active ? "bg-gold-500 text-black font-medium" : "border border-luxury-border text-luxury-muted hover:text-luxury-white"
              }`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-luxury-border bg-luxury-card py-16 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-luxury-muted opacity-50" />
          <p className="text-sm text-luxury-muted">Aucune notification {q || category !== "ALL" ? "ne correspond" : "pour le moment"}.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const meta = CATEGORY_META[n.category] ?? CATEGORY_META["SYSTEM"]!;
            const accent = PRIORITY_ACCENT[n.priority] ?? PRIORITY_ACCENT["STANDARD"]!;
            const Icon = meta.Icon;
            return (
              <li key={n.id}
                className={`group flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  n.isRead ? "border-luxury-border bg-luxury-card" : "border-gold-500/30 bg-gold-500/[0.05]"
                }`}>
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent.ring}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />}
                    <p className="truncate text-sm font-medium text-luxury-white">{n.title}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-luxury-muted">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-luxury-muted">
                    <span>{meta.label}</span>
                    <span>·</span>
                    <span>{timeAgoShort(n.createdAt)}</span>
                    {n.actionUrl && (
                      <Link href={n.actionUrl} onClick={() => markOne(n)} className="text-gold-400 hover:text-gold-300">Ouvrir</Link>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.isRead && (
                    <button onClick={() => markOne(n)} aria-label="Marquer comme lu"
                      className="rounded-lg p-1.5 text-luxury-muted hover:text-gold-400">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} aria-label="Supprimer"
                    className="rounded-lg p-1.5 text-luxury-muted hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
