import { type HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "muted" | "info";
}

const variantClasses: Record<BadgeProps["variant"] & string, string> = {
  default:
    "bg-[var(--color-primary-muted)] text-[var(--color-primary)] dark:bg-[var(--color-primary-muted)] dark:text-[var(--color-primary)]",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  muted: "bg-[var(--color-border)] text-[var(--color-muted)]",
  info: "bg-[#006699]/10 text-[#006699] dark:bg-[#4da6ff]/20 dark:text-[#4da6ff]",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
