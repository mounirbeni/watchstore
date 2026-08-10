import Image from "next/image";
import { cn } from "@/lib/utils";
import markSrc from "@/public/brand/mark.png";

/**
 * The ChronoCraft emblem — crowned chronograph flanked by gold wings.
 *
 * Ships as a transparent PNG so the same file sits on the white navbar, the
 * dark intro and photography alike; the black dial is part of the artwork,
 * not a background. Size it by height and let the width follow
 * (`className="h-9 w-auto"`) — the emblem is wider than it is tall.
 */

export interface LogoMarkProps {
  className?: string;
  /** Accessible name. Omit on decorative instances beside the wordmark. */
  title?: string;
  /** Set on the header instance so the mark is never late to first paint. */
  priority?: boolean;
}

export default function LogoMark({ className, title, priority = false }: LogoMarkProps) {
  return (
    <Image
      src={markSrc}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      priority={priority}
      sizes="(max-width: 768px) 120px, 200px"
      className={cn("h-9 w-auto shrink-0 select-none object-contain", className)}
    />
  );
}
