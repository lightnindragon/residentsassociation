import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]",
  secondary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)]",
  ghost:
    "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-[var(--color-border)]",
  outline:
    "border-2 border-[var(--color-border)] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 focus-visible:ring-[var(--color-border)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
