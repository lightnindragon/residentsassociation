"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { addResidentReply } from "@/app/actions/enquiries";

export function EnquiryReplyForm({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const replyBody = body.trim();
    if (!replyBody) {
      setError("Please enter a reply.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addResidentReply(messageId, replyBody);
      if (result.ok) {
        setBody("");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to send reply.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">
        Add a reply
      </h3>
      <p className="text-xs text-[var(--color-muted)]">
        Your reply will be added to the thread and the assigned contact will be notified. Replying here or by email will reopen the enquiry if it was closed.
      </p>
      <textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type your reply…"
        rows={4}
        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
        disabled={pending}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}
