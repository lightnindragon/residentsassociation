"use client";

import { useActionState } from "react";
import { createThread } from "@/app/forum/actions";

export function CreateThreadForm({ categoryId }: { categoryId: string }) {
  const [state, formAction] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      createThread(prev, formData),
    null
  );
  return (
    <form action={formAction} className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <input type="hidden" name="categoryId" value={categoryId} />
      <label className="block text-sm font-medium text-[var(--foreground)]">New thread</label>
      <input
        type="text"
        name="title"
        placeholder="Thread title"
        required
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2"
      />
      {state?.error && (
        <p className="mt-1 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
      >
        Post thread
      </button>
    </form>
  );
}
