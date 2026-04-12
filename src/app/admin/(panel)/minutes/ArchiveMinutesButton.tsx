"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveMinutesEntry, unarchiveMinutesEntry } from "@/app/admin/actions/minutes";

export function ArchiveMinutesButton({
  entryId,
  archived,
}: {
  entryId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-[var(--color-muted)] hover:underline disabled:opacity-50"
      onClick={() => {
        const msg = archived
          ? "Unarchive? It will appear on the public minutes page again."
          : "Archive? It will be hidden from the public site (still editable here).";
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
        start(async () => {
          const res = archived
            ? await unarchiveMinutesEntry(entryId)
            : await archiveMinutesEntry(entryId);
          if (res.ok) {
            router.refresh();
            toast.success(archived ? "Minutes unarchived." : "Minutes archived.");
          } else if (res.error) toast.error(res.error);
        });
      }}
    >
      {pending ? "…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
