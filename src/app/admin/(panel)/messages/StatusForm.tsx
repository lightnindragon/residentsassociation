"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMessageStatus, type MessageStatus } from "@/app/admin/actions/messages";

const STATUSES: { value: MessageStatus; label: string }[] = [
  { value: "unresponded", label: "Unresponded" },
  { value: "open", label: "Open" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

export function StatusForm({
  messageId,
  currentStatus,
}: {
  messageId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <span className="inline-flex items-center gap-2">
      <select
        defaultValue={currentStatus}
        className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-sm"
        onChange={(e) => {
          const status = e.target.value as MessageStatus;
          if (status) {
            startTransition(async () => {
              await updateMessageStatus(messageId, status);
              router.refresh();
            });
          }
        }}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {pending && <span className="text-xs text-[var(--color-muted)]">…</span>}
    </span>
  );
}
