import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "blue" | "orange" | "gray";
  className?: string;
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  gold:   "bg-gold-500/20 text-gold-400 border-gold-500/30",
  green:  "bg-green-500/20 text-green-400 border-green-500/30",
  red:    "bg-red-500/20 text-red-400 border-red-500/30",
  blue:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  gray:   "bg-luxury-border/50 text-luxury-muted border-luxury-border",
};

export default function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
