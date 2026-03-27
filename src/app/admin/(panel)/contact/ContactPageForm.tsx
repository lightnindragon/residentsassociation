"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveContactContent } from "@/app/admin/actions/contact-page";
import type { ContactContent } from "@/lib/site-content";

export function ContactPageForm({ initial }: { initial: ContactContent }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<"saved" | "error" | null>(null);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [labelName, setLabelName] = useState(initial.labelName);
  const [labelEmail, setLabelEmail] = useState(initial.labelEmail);
  const [labelSubject, setLabelSubject] = useState(initial.labelSubject);
  const [labelMessage, setLabelMessage] = useState(initial.labelMessage);
  const [labelSubmit, setLabelSubmit] = useState(initial.labelSubmit);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await saveContactContent({
        title,
        description,
        labelName,
        labelEmail,
        labelSubject,
        labelMessage,
        labelSubmit,
      });
      if (result.ok) {
        setMessage("saved");
        router.refresh();
      } else {
        setMessage("error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Page title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        />
      </div>
      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-sm font-medium text-[var(--foreground)]">Form labels</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-[var(--color-muted)]">Name field</label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className="mt-0.5 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)]">Email field</label>
            <input
              type="text"
              value={labelEmail}
              onChange={(e) => setLabelEmail(e.target.value)}
              className="mt-0.5 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)]">Subject field</label>
            <input
              type="text"
              value={labelSubject}
              onChange={(e) => setLabelSubject(e.target.value)}
              className="mt-0.5 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)]">Message field</label>
            <input
              type="text"
              value={labelMessage}
              onChange={(e) => setLabelMessage(e.target.value)}
              className="mt-0.5 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)]">Submit button</label>
            <input
              type="text"
              value={labelSubmit}
              onChange={(e) => setLabelSubmit(e.target.value)}
              className="mt-0.5 w-full rounded border border-[var(--color-border)] px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
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
