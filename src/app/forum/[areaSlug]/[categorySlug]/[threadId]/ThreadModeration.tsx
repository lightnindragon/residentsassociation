"use client";

import { useTransition } from "react";
import { toggleThreadPinned, toggleThreadLocked, toggleThreadAdminOnly } from "@/app/admin/actions/forum";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";

type Props = {
  threadId: string;
  pinned: boolean;
  locked: boolean;
  adminOnly: boolean;
};

export function ThreadModeration({ threadId, pinned, locked, adminOnly }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handlePin() {
    startTransition(async () => {
      await toggleThreadPinned(threadId, !pinned);
      router.refresh();
    });
  }

  function handleLock() {
    startTransition(async () => {
      await toggleThreadLocked(threadId, !locked);
      router.refresh();
    });
  }

  function handleAdminOnly() {
    startTransition(async () => {
      await toggleThreadAdminOnly(threadId, !adminOnly);
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
      <span className="text-xs font-medium text-[var(--color-muted)]">Moderate:</span>
      <Button
        type="button"
        variant="outline"
        className="px-2 py-1.5 text-xs"
        onClick={handlePin}
        disabled={pending}
      >
        {pinned ? "Unpin" : "Pin"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="px-2 py-1.5 text-xs"
        onClick={handleLock}
        disabled={pending}
      >
        {locked ? "Unlock" : "Lock"}
      </Button>
      <Button
        type="button"
        variant={adminOnly ? "primary" : "outline"}
        className="px-2 py-1.5 text-xs"
        onClick={handleAdminOnly}
        disabled={pending}
      >
        {adminOnly ? "Remove Admin-Only" : "Make Admin-Only"}
      </Button>
    </div>
  );
}
