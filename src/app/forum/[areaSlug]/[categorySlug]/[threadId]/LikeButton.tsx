"use client";

import { useTransition, useState } from "react";
import { togglePostLike } from "@/app/forum/actions/likes";
import { Button } from "@/components/ui";

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  pathToRevalidate,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  pathToRevalidate: string;
}) {
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  function handleToggle() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    startTransition(async () => {
      const res = await togglePostLike(postId, pathToRevalidate);
      if (!res.ok) {
        // Revert on failure
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      }
    });
  }

  return (
    <Button
      variant="ghost"
      onClick={handleToggle}
      disabled={pending}
      className={`px-2 py-1 text-xs ${
        liked ? "text-red-500 hover:text-red-600" : "text-[var(--color-muted)] hover:text-red-500"
      }`}
    >
      {liked ? "♥" : "♡"} {count > 0 ? count : "Like"}
    </Button>
  );
}
