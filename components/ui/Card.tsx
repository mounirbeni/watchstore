import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export default function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-luxury-card border border-luxury-border rounded-xl",
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
