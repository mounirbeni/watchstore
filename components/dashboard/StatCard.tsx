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
    <Card className="rounded-2xl">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-luxury-muted">{label}</p>
        {Icon && (
          <span className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
            <Icon className="h-[18px] w-[18px] text-gold-400" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-serif font-semibold text-white">{value}</p>
      {detail && <p className="mt-1 text-sm text-luxury-muted">{detail}</p>}
    </Card>
  );
}
