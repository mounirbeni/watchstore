"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  total: number;
  itemCount: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(n);

export default function MobileCartBar({ total, itemCount }: Props) {
  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-[var(--mobile-nav-h)] left-0 right-0 z-40 border-t border-luxury-border bg-white px-4 py-3 flex items-center gap-4">
      <div className="min-w-0">
        <p className="text-[11px] text-luxury-muted leading-none mb-0.5">
          {itemCount} article{itemCount > 1 ? "s" : ""}
        </p>
        <p className="font-bold text-luxury-white text-base leading-none">{fmt(total)}</p>
      </div>
      <Link
        href="/checkout"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-luxury-white text-white text-sm font-bold py-3.5 hover:opacity-80 transition-opacity active:scale-[0.98]"
      >
        Commander <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
