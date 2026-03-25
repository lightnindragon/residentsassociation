import { type HTMLAttributes, forwardRef } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition-colors ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-heading text-xl font-medium text-[var(--foreground)] ${className}`}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`mt-3 text-[var(--color-muted)] ${className}`} {...props} />
  )
);

CardContent.displayName = "CardContent";

export { Card, CardHeader, CardContent };
