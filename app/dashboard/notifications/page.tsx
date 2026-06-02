import { requireAuth } from "@/lib/session";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requireAuth();
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Notifications"
        subtitle="Tout ce qui se passe sur votre compte, en temps réel."
        backHref="/dashboard"
      />
      <NotificationCenter />
    </div>
  );
}
