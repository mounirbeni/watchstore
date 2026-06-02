import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-luxury-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "bg-luxury-dark border text-luxury-white placeholder-luxury-muted rounded-lg px-4 py-2.5",
            "focus:outline-none focus:ring-1 transition-colors duration-200",
            error
              ? "border-gold-500 focus:ring-gold-500"
              : "border-luxury-border focus:ring-gold-500 focus:border-gold-500",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-gold-400">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export default Input;
