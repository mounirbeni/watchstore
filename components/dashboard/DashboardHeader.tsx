import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Shows a "back to account" link on mobile (where the sidebar is hidden). */
  backHref?: string;
}

export default function DashboardHeader({ title, subtitle, action, backHref }: Props) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="lg:hidden inline-flex items-center gap-1 text-sm text-luxury-muted hover:text-gold-400 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4" /> Mon compte
          </Link>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Espace client</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-semibold text-luxury-white">{title}</h1>
        {subtitle && <p className="mt-2 text-sm sm:text-base text-luxury-muted max-w-xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
