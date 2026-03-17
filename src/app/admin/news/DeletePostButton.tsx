"use client";

import { deletePost } from "@/app/admin/actions/news";

export function DeletePostButton({ postId }: { postId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this post?")) return;
        await deletePost(postId);
      }}
      className="inline"
    >
      <button
        type="submit"
        className="text-red-600 hover:underline dark:text-red-400"
      >
        Delete
      </button>
    </form>
  );
}
