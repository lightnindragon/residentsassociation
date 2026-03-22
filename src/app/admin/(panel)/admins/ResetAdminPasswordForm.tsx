"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { resetAdminPassword } from "@/app/admin/actions/admins";

export function ResetAdminPasswordForm({ userId }: { userId: string }) {
  const [pw, setPw] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <label className="text-xs text-[var(--color-muted)]">New password</label>
        <input
          type="password"
          value={pw}
          minLength={10}
          onChange={(e) => setPw(e.target.value)}
          className="mt-0.5 block rounded border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 text-sm"
        />
      </div>
      <button
        type="button"
        disabled={pending}
        className="rounded bg-[var(--color-border)] px-3 py-1.5 text-sm"
        onClick={() =>
          start(async () => {
            const r = await resetAdminPassword(userId, pw);
            if (r.ok) {
              toast.success("Password updated.");
              setPw("");
            } else toast.error(r.error ?? "Failed.");
          })
        }
      >
        Reset password
      </button>
    </div>
  );
}
