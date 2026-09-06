"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPost, updatePost } from "@/app/admin/actions/news";
import { Input } from "@/components/ui";
import { RichTextEditor } from "@/components/RichTextEditor";
import { BlogImageUpload } from "@/components/BlogImageUpload";
import { PublishNotifyFields, toastPublishResult } from "@/components/PublishNotifyFields";

function updatePostBound(id: string) {
  return (prev: unknown, formData: FormData) => updatePost(id, prev, formData);
}

type Cat = { id: string; name: string; slug: string };

export function NewsPostForm({
  authorId,
  categories = [],
  post,
}: {
  authorId: string;
  admins?: { id: string; name: string }[];
  categories?: Cat[];
  post?: {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    published_at: string | null;
    post_category_id: string | null;
    cover_image_url: string | null;
    subscribers_notified_at?: string | null;
  };
}) {
  const isEdit = !!post;
  const [state, formAction] = useActionState(
    isEdit
      ? (prev: unknown, formData: FormData) =>
          updatePostBound(post!.id)(prev, formData)
      : createPost,
    null
  );
  const lastStateRef = useRef<typeof state>(null);

  useEffect(() => {
    if (!state || state === lastStateRef.current) return;
    lastStateRef.current = state;

    toastPublishResult(state, isEdit ? "News article updated." : "News article created.");
  }, [isEdit, state]);

  return (
    <>
      {state?.ok && (
        <p className="mt-4 rounded-lg bg-[var(--color-primary-muted)] px-3 py-2 text-sm text-[var(--color-primary-hover)]">
          {isEdit ? "Post updated." : "Post created."}
        </p>
      )}
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-6 flex max-w-3xl flex-col gap-4">
        <input type="hidden" name="authorId" value={authorId} />
        <Input
          label="Title"
          name="title"
          defaultValue={post?.title}
          required
          placeholder="Post title"
        />
        <Input
          label="Excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ""}
          placeholder="Short summary (optional)"
        />
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Category</label>
            <select
              name="post_category_id"
              defaultValue={post?.post_category_id ?? ""}
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <BlogImageUpload name="cover_image_url" currentUrl={post?.cover_image_url} />
        <div>
          <span className="mb-1 block text-sm font-medium text-[var(--foreground)]">
            Article (use the toolbar — you won&apos;t see HTML)
          </span>
          <RichTextEditor name="body" initialHtml={post?.body ?? ""} />
        </div>
        <PublishNotifyFields
          defaultPublished={!!post?.published_at}
          notifiedAt={post?.subscribers_notified_at}
          submitLabel={isEdit ? "Update" : "Create"}
          sendKind="news"
          sendId={post?.id}
        />
      </form>
    </>
  );
}
