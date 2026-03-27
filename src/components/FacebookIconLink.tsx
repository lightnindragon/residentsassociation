/** Standard Facebook mark, drawn small inside a square tile. */
function FacebookMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** `onDark` — header & footer slate bar; `light` — pale backgrounds only */
type Variant = "onDark" | "light";

const variantClasses: Record<Variant, string> = {
  light:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] transition-colors hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
  onDark:
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/60 transition-colors hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
};

export function FacebookIconLink({
  href,
  variant,
  className = "",
}: {
  href: string;
  variant: Variant;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${variantClasses[variant]} ${className}`.trim()}
      aria-label="Culcheth & Glazebury Residents Association on Facebook"
    >
      <FacebookMark className="h-3.5 w-3.5" />
    </a>
  );
}
