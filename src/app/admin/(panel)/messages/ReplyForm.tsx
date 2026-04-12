"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addAdminReply } from "@/app/admin/actions/messages";

export function ReplyForm({ messageId }: { messageId: string }) {
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
      const result = await addAdminReply(messageId, replyBody);
      if (result.ok) {
        setBody("");
        toast.success("Reply sent to Resident.");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to send reply.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">Reply To Resident</h3>
      <textarea
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Your reply will be emailed to the Resident and added to the thread."
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
