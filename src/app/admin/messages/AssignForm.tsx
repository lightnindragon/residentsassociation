"use client";

import { useTransition } from "react";
import { assignMessageAction } from "@/app/admin/actions/messages";

type Admin = { id: string; name: string; email: string };

export function AssignForm({
  messageId,
  currentAssignedToId,
  admins,
}: {
  messageId: string;
  currentAssignedToId: string | null;
  admins: Admin[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData: FormData) => {
        startTransition(() => assignMessageAction(formData));
      }}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="messageId" value={messageId} />
      <select
        name="assignedTo"
        defaultValue={currentAssignedToId ?? ""}
        className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-sm"
      >
        <option value="">—</option>
        {admins.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--color-primary)] px-2 py-1 text-xs text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "…" : "Assign"}
      </button>
    </form>
  );
}
