"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveEvent, unarchiveEvent } from "@/app/admin/actions/events";

export function ArchiveEventButton({ eventId, archived }: { eventId: string; archived: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-[var(--color-muted)] hover:underline disabled:opacity-50"
      onClick={() => {
        const msg = archived
          ? "Unarchive? It will appear on the public events page again."
          : "Archive? It will be hidden from the public site (still editable here).";
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
        start(async () => {
          const res = archived ? await unarchiveEvent(eventId) : await archiveEvent(eventId);
          if (res.ok) {
            router.refresh();
            toast.success(archived ? "Event unarchived." : "Event archived.");
          } else if (res.error) toast.error(res.error);
        });
      }}
    >
      {pending ? "…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
