"use client";

import { useActionState, useState } from "react";
import { createThread } from "@/app/forum/actions";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui";

export function CreateThreadForm({ categoryId, isAdmin }: { categoryId: string; isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      createThread(prev, formData),
    null
  );

  if (!isOpen) {
    return (
      <div className="mt-6">
        <Button onClick={() => setIsOpen(true)}>Post new thread</Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
      <input type="hidden" name="categoryId" value={categoryId} />
      <div className="flex items-center justify-between mb-4">
        <label className="block text-lg font-semibold text-[var(--foreground)]">Create a new thread</label>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
      <input
        type="text"
        name="title"
        placeholder="Thread title"
        required
        className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
      />
      <RichTextEditor name="body" initialHtml="" placeholder="Write your first post..." />
      {isAdmin && (
        <label className="mt-3 flex items-center gap-2 text-sm text-[var(--color-muted)] cursor-pointer select-none">
          <input type="checkbox" name="adminOnly" value="1" className="rounded border-[var(--color-border)]" />
          <span>Admin-only thread (announcements — only admins can reply)</span>
        </label>
      )}
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="mt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit">
          Post thread
        </Button>
      </div>
    </form>
  );
}
