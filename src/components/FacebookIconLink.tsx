/** Official Facebook “f” mark — prominent CTA in header & footer. */
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

type Variant = "header" | "footer";

const variantClasses: Record<
  Variant,
  { wrap: string; icon: string }
> = {
  header: {
    wrap:
      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md ring-2 ring-[#1877F2]/30 transition hover:bg-[#166fe5] hover:ring-[#1877F2]/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1877F2] sm:h-14 sm:w-14",
    icon: "h-7 w-7 sm:h-8 sm:w-8",
  },
  footer: {
    wrap:
      "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg ring-2 ring-white/25 transition hover:bg-[#166fe5] hover:ring-white/40 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    icon: "h-8 w-8",
  },
};

export function FacebookIconLink({
  href,
  variant,
}: {
  href: string;
  variant: Variant;
}) {
  const v = variantClasses[variant];
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={v.wrap}
      aria-label="Culcheth & Glazebury Residents Association on Facebook"
    >
      <FacebookMark className={v.icon} />
    </a>
  );
}
