"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAboutIntro } from "@/app/admin/actions/about";

export function AboutIntroForm({ initialIntro }: { initialIntro: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [intro, setIntro] = useState(initialIntro);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveAboutIntro(intro);
      if (result.ok) {
        setMessage("saved");
        router.refresh();
      } else {
        setMessage("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        Intro text
      </label>
      <textarea
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        rows={8}
        className="mt-1 w-full max-w-2xl rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save intro"}
        </button>
        {message === "saved" && (
          <span className="text-sm text-[var(--color-primary)]">Saved.</span>
        )}
        {message === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">Failed to save.</span>
        )}
      </div>
    </form>
  );
}
