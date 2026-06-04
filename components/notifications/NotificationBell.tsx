"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notifications";
import { CATEGORY_META, PRIORITY_ACCENT, timeAgoShort, type NotificationDTO } from "./meta";

const POLL_MS = 25_000;

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=8", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items);
      setUnread(data.unreadCount);
    } catch {
      /* offline — keep last state */
    }
  }, []);

  // Initial + interval polling (near real-time without page refresh).
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Refetch when the tab regains focus.
  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  // Close on route change + outside click.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleMarkAll() {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsReadAction();
    refresh();
  }

  async function handleOpenItem(n: NotificationDTO) {
    if (!n.isRead) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      await markNotificationReadAction(n.id);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); if (!open) refresh(); }}
        className="relative p-2 text-luxury-light hover:text-gold-400 transition-colors active:scale-90"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-luxury-border bg-luxury-card shadow-2xl z-[60]">
          <div className="flex items-center justify-between border-b border-luxury-border px-4 py-3">
            <span className="text-sm font-semibold text-luxury-white">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">
                <Check className="h-3.5 w-3.5" /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-luxury-muted">
                <Bell className="mx-auto mb-2 h-6 w-6 opacity-40" />
                Aucune notification
              </div>
            ) : (
              items.map((n) => {
                const meta = CATEGORY_META[n.category] ?? CATEGORY_META["SYSTEM"]!;
                const accent = PRIORITY_ACCENT[n.priority] ?? PRIORITY_ACCENT["STANDARD"]!;
                const Icon = meta.Icon;
                const body = (
                  <div className={`flex gap-3 px-4 py-3 transition-colors hover:bg-luxury-border/30 ${n.isRead ? "" : "bg-gold-500/[0.04]"}`}>
                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent.ring}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-luxury-white">
                        {!n.isRead && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />}
                        <span className="truncate">{n.title}</span>
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-luxury-muted">{n.message}</p>
                      <p className="mt-1 text-[11px] text-luxury-muted">{timeAgoShort(n.createdAt)}</p>
                    </div>
                  </div>
                );
                return n.actionUrl ? (
                  <Link key={n.id} href={n.actionUrl} onClick={() => handleOpenItem(n)} className="block">{body}</Link>
                ) : (
                  <button key={n.id} onClick={() => handleOpenItem(n)} className="block w-full text-left">{body}</button>
                );
              })
            )}
          </div>

          <Link href="/dashboard/notifications" className="block border-t border-luxury-border px-4 py-3 text-center text-sm text-gold-400 hover:text-gold-300">
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
