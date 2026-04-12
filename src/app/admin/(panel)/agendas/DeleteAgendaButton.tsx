"use client";

import { deleteAgenda } from "@/app/admin/actions/agendas";

export function DeleteAgendaButton({ agendaId }: { agendaId: string }) {
  return (
    <form
      action={async () => {
        if (typeof window !== "undefined" && !confirm("Delete this agenda?")) return;
        await deleteAgenda(agendaId);
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
