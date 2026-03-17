"use client";

import { useActionState } from "react";
import { createPost, updatePost } from "@/app/admin/actions/news";
import { Input, Textarea, Button } from "@/components/ui";

function updatePostBound(id: string) {
  return (prev: unknown, formData: FormData) => updatePost(id, prev, formData);
}

type Admin = { id: string; name: string };

export function NewsPostForm({
  authorId,
  admins,
  post,
}: {
  authorId: string;
  admins: Admin[];
  post?: {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    published_at: string | null;
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

  return (
    <>
      {state?.error && (
        <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {state.error}
        </p>
      )}
      <form action={formAction} className="mt-6 flex max-w-xl flex-col gap-4">
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
        <Textarea
          label="Body"
          name="body"
          defaultValue={post?.body ?? ""}
          required
          rows={12}
          placeholder="Content..."
        />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" value="1" defaultChecked={!!post?.published_at} />
          <span className="text-sm">Published (visible on site)</span>
        </label>
        <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
      </form>
    </>
  );
}
