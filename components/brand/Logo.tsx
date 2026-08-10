import Link from "next/link";
import { cn } from "@/lib/utils";
import LogoMark from "./LogoMark";

export const BRAND = {
  name: "ChronoCraft",
  nameLead: "Chrono",
  nameTail: "Craft",
  tagline: "L'art du temps",
  claim: "Maison horlogère · Maroc",
  since: "MMXIX",
} as const;

interface LogoProps {
  /** Wraps the lockup in a link to the homepage. */
  href?: string | null;
  size?: "sm" | "md" | "lg";
  tone?: "gold" | "light" | "dark";
  /** Hide the wordmark and keep the emblem only (compact app bars). */
  markOnly?: boolean;
  /** Show the small "L'art du temps" line under the wordmark. */
  withTagline?: boolean;
  /** Prioritise the image — set on the header instance. */
  priority?: boolean;
  className?: string;
}

/**
 * Emblem heights are set per size; the width follows the artwork's ratio.
 */
const SIZES = {
  sm: { mark: "h-10", word: "text-base", tagline: "text-[8px] tracking-[0.3em]", gap: "gap-2" },
  md: { mark: "h-12", word: "text-xl", tagline: "text-[9px] tracking-[0.32em]", gap: "gap-2" },
  lg: { mark: "h-24", word: "text-3xl", tagline: "text-[11px] tracking-[0.36em]", gap: "gap-2" },
} as const;

/**
 * The single source of truth for the ChronoCraft lockup. Header, footer,
 * auth screens, the mobile drawer and the intro reveal all render this so the
 * brand never drifts between surfaces.
 */
export default function Logo({
  href = "/",
  size = "md",
  tone = "gold",
  markOnly = false,
  withTagline = false,
  priority = false,
  className,
}: LogoProps) {
  const s = SIZES[size];
  const leadColor = tone === "light" ? "text-white" : "text-luxury-white";

  const lockup = (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <LogoMark className={cn(s.mark, "w-auto")} priority={priority} />
      {!markOnly && (
        <span className="inline-flex flex-col leading-none">
          <span className={cn("font-serif font-bold tracking-[0.01em]", s.word, leadColor)}>
            {BRAND.nameLead}
            <span className={tone === "light" ? "text-gold-300" : "gold-text"}>{BRAND.nameTail}</span>
          </span>
          {withTagline && (
            <span
              className={cn(
                "mt-1 font-semibold uppercase",
                s.tagline,
                tone === "light" ? "text-white/55" : "text-luxury-muted",
              )}
            >
              {BRAND.tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!href) return lockup;

  return (
    <Link
      href={href}
      aria-label={`${BRAND.name} — accueil`}
      className="inline-flex items-center rounded-lg transition-transform duration-200 hover:opacity-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 focus-visible:ring-offset-2"
    >
      {lockup}
    </Link>
  );
}
