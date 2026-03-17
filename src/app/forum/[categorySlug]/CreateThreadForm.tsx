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
    <form action={formAction} className="mt-4">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input
        type="text"
        name="title"
        placeholder="New thread title"
        required
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2"
      />
      {state?.error && (
        <p className="mt-1 text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        className="mt-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)]"
      >
        Create thread
      </button>
    </form>
  );
}
