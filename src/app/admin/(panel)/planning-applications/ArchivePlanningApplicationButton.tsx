"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  archivePlanningApplication,
  unarchivePlanningApplication,
} from "@/app/admin/actions/planning";

export function ArchivePlanningApplicationButton({
  applicationId,
  archived,
}: {
  applicationId: string;
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
          ? "Unarchive? It will appear on the public planning page again."
          : "Archive? It will be hidden from the public site (still editable here).";
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
        start(async () => {
          const res = archived
            ? await unarchivePlanningApplication(applicationId)
            : await archivePlanningApplication(applicationId);
          if (res.ok) {
            router.refresh();
            toast.success(archived ? "Application unarchived." : "Application archived.");
          } else if (res.error) toast.error(res.error);
        });
      }}
    >
      {pending ? "…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
