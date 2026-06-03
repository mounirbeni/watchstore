import { requireAdmin } from "@/lib/session";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Console admin</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-luxury-white">Notifications</h1>
        <p className="mt-2 text-luxury-muted">Commandes, paiements, stock et alertes de sécurité, en temps réel.</p>
      </header>
      <NotificationCenter />
    </div>
  );
}
