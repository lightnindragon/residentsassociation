"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archivePost, unarchivePost } from "@/app/admin/actions/news";

export function ArchivePostButton({ postId, archived }: { postId: string; archived: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-[var(--color-muted)] hover:underline disabled:opacity-50"
      onClick={() => {
        const msg = archived
          ? "Unarchive this post? It will appear on the public news pages again."
          : "Archive this post? It will be hidden from the public site (still editable here).";
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
        start(async () => {
          const res = archived ? await unarchivePost(postId) : await archivePost(postId);
          if (res.ok) {
            router.refresh();
            toast.success(archived ? "Post unarchived." : "Post archived.");
          } else if (res.error) toast.error(res.error);
        });
      }}
    >
      {pending ? "…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
