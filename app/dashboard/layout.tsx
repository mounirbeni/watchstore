import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MobileTabBar from "@/components/layout/MobileTabBar";

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/login?from=/dashboard");
  }

  return (
    <div className="min-h-screen bg-luxury-dark pb-mobile-nav">
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <DashboardNav
            user={{
              firstName: session.firstName,
              lastName: session.lastName,
              email: session.email,
            }}
          />
        </div>
        <section className="min-w-0">{children}</section>
      </main>
      <MobileTabBar />
    </div>
  );
}
