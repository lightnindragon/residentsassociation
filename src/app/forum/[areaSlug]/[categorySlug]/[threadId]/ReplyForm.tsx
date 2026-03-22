"use client";

import { useActionState } from "react";
import { createReply } from "@/app/forum/actions";
import { Textarea, Button } from "@/components/ui";

export function ReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      createReply(prev, formData),
    null
  );
  return (
    <form action={formAction} className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <input type="hidden" name="threadId" value={threadId} />
      <Textarea
        name="body"
        label="Your reply"
        placeholder="Write your message..."
        rows={4}
        required
      />
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="mt-3">
        Post reply
      </Button>
    </form>
  );
}
