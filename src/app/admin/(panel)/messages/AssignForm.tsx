"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { assignMessage } from "@/app/admin/actions/messages";

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
  const selectRef = useRef<HTMLSelectElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const assignedTo = selectRef.current?.value ?? "general";
        startTransition(async () => {
          const r = await assignMessage(
            messageId,
            assignedTo === "general" ? "general" : assignedTo
          );
          if (r.ok) toast.success("Assignment updated — notification email sent if configured.");
          else toast.error(r.error ?? "Assignment failed.");
        });
      }}
      className="inline-flex items-center gap-2"
    >
      <select
        ref={selectRef}
        name="assignedTo"
        defaultValue={currentAssignedToId ?? "general"}
        className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-sm"
      >
        <option value="general">General</option>
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
