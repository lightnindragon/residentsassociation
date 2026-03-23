"use client";

import { useTransition, useState, useRef } from "react";
import { saveForumProfile } from "../actions/profile";

export function ForumSetupForm({ redirectTo }: { redirectTo: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await saveForumProfile(formData);
      if (result.ok) {
        window.location.href = redirectTo;
      } else {
        setError(result.error ?? "Failed to save.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-[var(--foreground)]">
          Avatar (optional)
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
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
