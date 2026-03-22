"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/app/forum/actions/follow";

const labels: Record<"area" | "category" | "thread", { on: string; off: string }> = {
  thread: { on: "Following thread", off: "Follow thread" },
  category: { on: "Following category", off: "Follow category" },
  area: { on: "Following area", off: "Follow area" },
};

export function ForumFollowButton({
  targetType,
  targetId,
  userId,
  initialFollowing = false,
}: {
  targetType: "area" | "category" | "thread";
  targetId: string;
  userId: string;
  initialFollowing?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();
  const L = labels[targetType];

  function click() {
    startTransition(async () => {
      const r = await toggleFollow(targetType, targetId);
      if (r.ok) setFollowing(r.following);
      router.refresh();
    });
  }

  if (!userId) return null;

  return (
    <button
      type="button"
      onClick={click}
      disabled={pending}
      className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--color-border)]/40 disabled:opacity-50"
    >
      {pending ? "…" : following ? L.on : L.off}
    </button>
  );
}
