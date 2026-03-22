"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveResident } from "@/app/admin/actions/residents";

export function ApproveResidentButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await approveResident(userId);
          if (r.ok) {
            toast.success("Resident approved — email sent if SMTP is configured.");
            router.refresh();
          } else {
            toast.error("Approval failed.");
          }
        })
      }
      className="rounded bg-[var(--color-primary)] px-2 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "…" : "Approve"}
    </button>
  );
}
