import Card from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  detail,
  Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  Icon?: LucideIcon;
}) {
  return (
    <Card className="rounded-2xl p-4 sm:p-5" padding="none">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-luxury-muted sm:text-xs sm:tracking-[0.18em]">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold-500/10 sm:h-9 sm:w-9">
            <Icon className="h-4 w-4 text-gold-400 sm:h-[18px] sm:w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-serif font-semibold text-luxury-white sm:mt-3 sm:text-3xl">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-luxury-muted sm:mt-1 sm:text-sm">{detail}</p>}
    </Card>
  );
}
