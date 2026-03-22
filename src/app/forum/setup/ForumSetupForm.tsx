"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveForumProfile } from "../actions/profile";

export function ForumSetupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement)?.value?.trim() ?? "";
    const town = (form.elements.namedItem("town") as HTMLInputElement)?.value?.trim() ?? "";
    if (!username || !town) {
      setError("Username and town are required.");
      return;
    }
    startTransition(async () => {
      const result = await saveForumProfile(username, town);
      if (result.ok) {
        router.replace(redirectTo);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)]">
          Forum username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="How you'll appear in the forum"
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="town" className="block text-sm font-medium text-[var(--foreground)]">
          Town you live in
        </label>
        <input
          id="town"
          name="town"
          type="text"
          required
          placeholder="e.g. Culcheth"
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save and continue to forum"}
      </button>
    </form>
  );
}
