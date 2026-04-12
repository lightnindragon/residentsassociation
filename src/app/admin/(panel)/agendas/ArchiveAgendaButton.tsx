"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveAgenda, unarchiveAgenda } from "@/app/admin/actions/agendas";

export function ArchiveAgendaButton({
  agendaId,
  archived,
}: {
  agendaId: string;
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
          ? "Unarchive? It will appear on the public agendas page again."
          : "Archive? It will be hidden from the public site (still editable here).";
        if (typeof window !== "undefined" && !window.confirm(msg)) return;
        start(async () => {
          const res = archived ? await unarchiveAgenda(agendaId) : await archiveAgenda(agendaId);
          if (res.ok) {
            router.refresh();
            toast.success(archived ? "Agenda unarchived." : "Agenda archived.");
          } else if (res.error) toast.error(res.error);
        });
      }}
    >
      {pending ? "…" : archived ? "Unarchive" : "Archive"}
    </button>
  );
}
