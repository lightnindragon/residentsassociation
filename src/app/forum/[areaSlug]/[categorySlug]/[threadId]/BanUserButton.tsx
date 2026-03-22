"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserBanned } from "@/app/admin/actions/residents";

export function BanUserButton({ targetUserId }: { targetUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function ban() {
    if (!confirm("Ban this user from posting? They will not be able to sign in.")) return;
    startTransition(async () => {
      await setUserBanned(targetUserId, true);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={ban}
      disabled={pending}
      className="text-xs text-amber-700 hover:underline disabled:opacity-50 dark:text-amber-400"
    >
      {pending ? "…" : "Ban user"}
    </button>
  );
}
