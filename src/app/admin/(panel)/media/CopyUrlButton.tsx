"use client";

import { toast } from "sonner";

export function CopyUrlButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      className="shrink-0 text-left text-[var(--color-primary)] hover:underline sm:text-right"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Copied URL");
        } catch {
          toast.error("Could not copy");
        }
      }}
    >
      Copy URL
    </button>
  );
}
