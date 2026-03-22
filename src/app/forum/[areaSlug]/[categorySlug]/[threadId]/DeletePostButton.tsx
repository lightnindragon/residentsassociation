"use client";

import { useTransition } from "react";
import { deleteForumPost } from "@/app/admin/actions/forum";
import { useRouter } from "next/navigation";

type Props = { postId: string; threadId: string };

export function DeletePostButton({ postId, threadId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this reply?")) return;
    startTransition(async () => {
      await deleteForumPost(postId, threadId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
