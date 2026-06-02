import Card from "@/components/ui/Card";

export default function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card className="rounded-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-luxury-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {detail && <p className="mt-2 text-sm text-luxury-muted">{detail}</p>}
    </Card>
  );
}
