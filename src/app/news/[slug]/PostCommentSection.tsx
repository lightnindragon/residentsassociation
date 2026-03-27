"use client";

import { useActionState } from "react";
import { addPostComment } from "@/app/actions/post-comments";
import { Button } from "@/components/ui";
import { formatUkDateTime } from "@/lib/date-format";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  display_name: string | null;
};

function makeBoundAction(postId: string, slug: string, title: string) {
  return (_prev: { error?: string } | null, formData: FormData) =>
    addPostComment(postId, slug, title, _prev, formData);
}

export function PostCommentSection({
  postId,
  slug,
  title,
  comments,
  canComment,
  loginHint,
}: {
  postId: string;
  slug: string;
  title: string;
  comments: CommentRow[];
  canComment: boolean;
  loginHint?: string;
}) {
  const [state, formAction] = useActionState(makeBoundAction(postId, slug, title), null);

  return (
    <section className="mt-12 border-t border-[var(--color-border)] pt-10">
      <h2 className="font-heading text-xl font-semibold text-[var(--foreground)]">Comments</h2>
      <ul className="mt-4 space-y-4">
        {comments.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">No comments yet.</li>
        ) : (
          comments.map((c) => (
            <li
              key={c.id}
              id={`comment-${c.id}`}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4"
            >
              <p className="text-xs text-[var(--color-muted)]">
                {c.display_name ?? "Resident"} · {formatUkDateTime(c.created_at)}
              </p>
              <div
                className="prose prose-sm mt-2 max-w-none text-[var(--foreground)]"
                dangerouslySetInnerHTML={{ __html: c.body }}
              />
            </li>
          ))
        )}
      </ul>
      {canComment ? (
        <form action={formAction} className="mt-6 flex max-w-xl flex-col gap-2">
          <label className="text-sm font-medium text-[var(--foreground)]">Add a comment</label>
          <textarea
            name="body"
            rows={4}
            required
            className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="Write your comment…"
          />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit">Post comment</Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-[var(--color-muted)]">{loginHint}</p>
      )}
    </section>
  );
}
