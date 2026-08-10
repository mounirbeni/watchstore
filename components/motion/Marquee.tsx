import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  /** Seconds for one full loop — larger is slower. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Continuously scrolling brand ticker. Pure CSS (no JS on the client) and
 * paused automatically under `prefers-reduced-motion` via globals.css.
 */
export default function Marquee({ items, speed = 32, reverse = false, className }: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        "[-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 items-center gap-10 pr-10 motion-safe:animate-marquee group-hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {track.slice(0, items.length).map((item, i) => (
            <span key={`${item}-${i}`} className="flex shrink-0 items-center gap-10">
              <span className="whitespace-nowrap font-serif text-lg font-semibold tracking-wide text-luxury-white/80 sm:text-xl">
                {item}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500/60" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
