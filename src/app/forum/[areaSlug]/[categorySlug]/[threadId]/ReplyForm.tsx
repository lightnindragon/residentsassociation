"use client";

import { useActionState } from "react";
import { createReply } from "@/app/forum/actions";
import { Button } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      createReply(prev, formData),
    null
  );
  return (
    <form id="reply-form" action={formAction} className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <input type="hidden" name="threadId" value={threadId} />
      <div className="mb-2 text-sm font-medium text-[var(--foreground)]">Your reply</div>
      <RichTextEditor name="body" initialHtml="" placeholder="Write your message..." />
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="mt-3">
        Post reply
      </Button>
    </form>
  );
}
