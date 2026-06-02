import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAuth();
  } catch {
    redirect("/login?from=/dashboard");
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        <DashboardNav role="client" />
        <section className="min-w-0">{children}</section>
      </main>
    </div>
  );
}
