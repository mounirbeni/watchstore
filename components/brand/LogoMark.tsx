import { cn } from "@/lib/utils";

/**
 * ChronoCraft monogram — a stylised watch bezel with a "C" crown notch,
 * four cardinal indices and the signature 10:10 hand position.
 *
 * Rendered as a pure SVG (no client JS) so it can be used inside server
 * components, e-mail-safe surfaces and the intro reveal alike. Every stroke
 * carries a class name so the intro overlay can animate the paths
 * individually with framer-motion.
 */

export interface LogoMarkProps {
  className?: string;
  /** `gold` on light surfaces, `light` on photography / dark surfaces. */
  tone?: "gold" | "light" | "dark";
  /** Unique suffix when several marks share a page (SVG ids must be unique). */
  idSuffix?: string;
  title?: string;
}

const TONES = {
  gold: { ring: "#C9A86A", ringSoft: "#E7D3A9", hand: "#1A1A1A", dial: "#1A1A1A" },
  light: { ring: "#E7D3A9", ringSoft: "#FFFFFF", hand: "#FFFFFF", dial: "#FFFFFF" },
  dark: { ring: "#1A1A1A", ringSoft: "#6B7280", hand: "#C9A86A", dial: "#1A1A1A" },
} as const;

export default function LogoMark({
  className,
  tone = "gold",
  idSuffix = "",
  title,
}: LogoMarkProps) {
  const c = TONES[tone];
  const gid = `cc-grad${idSuffix}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={gid} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor={c.ringSoft} />
          <stop offset="0.5" stopColor={c.ring} />
          <stop offset="1" stopColor={c.ring} stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Crown */}
      <path
        className="cc-crown"
        d="M32 3.5v5"
        stroke={`url(#${gid})`}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Outer bezel */}
      <circle
        className="cc-bezel"
        cx="32"
        cy="32"
        r="24"
        stroke={`url(#${gid})`}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Inner dial ring */}
      <circle
        className="cc-dial"
        cx="32"
        cy="32"
        r="18"
        stroke={c.dial}
        strokeOpacity="0.14"
        strokeWidth="1.5"
      />

      {/* Cardinal indices */}
      <g className="cc-index" stroke={`url(#${gid})`} strokeWidth="2.6" strokeLinecap="round">
        <path d="M32 12.5v4.5" />
        <path d="M32 47v4.5" />
        <path d="M12.5 32H17" />
        <path d="M47 32h4.5" />
      </g>

      {/* Hands at 10:10 — the horologist's smile */}
      <path
        className="cc-hand-hour"
        d="M32 32 21.5 21.5"
        stroke={c.hand}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        className="cc-hand-minute"
        d="M32 32 44 22.5"
        stroke={c.hand}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle className="cc-pin" cx="32" cy="32" r="2.6" fill={`url(#${gid})`} />
    </svg>
  );
}
