import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/Card";

export const metadata = { title: "Audit Logs" };

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { include: { profile: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Admin console</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-semibold text-luxury-white">Audit logs</h1>
        <p className="mt-2 text-luxury-muted">Important business and security actions are persisted here.</p>
      </header>

      <Card className="overflow-hidden rounded-2xl" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-luxury-dark text-xs uppercase tracking-[0.16em] text-luxury-muted">
              <tr><th className="px-5 py-4">Time</th><th className="px-5 py-4">Actor</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Entity</th><th className="px-5 py-4">IP</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-luxury-border">
                  <td className="px-5 py-4 text-luxury-muted">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-4 text-luxury-muted">{log.user?.email ?? "System"}</td>
                  <td className="px-5 py-4 font-medium text-luxury-white">{log.action}</td>
                  <td className="px-5 py-4 text-luxury-muted">{log.entity}{log.entityId ? ` / ${log.entityId}` : ""}</td>
                  <td className="px-5 py-4 text-luxury-muted">{log.ipAddress ?? "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
