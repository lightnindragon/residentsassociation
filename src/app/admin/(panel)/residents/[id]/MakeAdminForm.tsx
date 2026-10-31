"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { AdminPermissionsFields } from "../../admins/AdminPermissionsFields";
import { promoteResidentToAdmin } from "@/app/admin/actions/admins";

export function MakeAdminForm({
  userId,
  canAssignDev,
}: {
  userId: string;
  canAssignDev: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const res = await promoteResidentToAdmin(userId, formData);
      if (res.ok) {
        toast.success("This resident is now an administrator.");
        router.push("/admin/admins");
      } else {
        toast.error(res.error ?? "Could not make them an admin.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-[var(--color-muted)]">
        This keeps the same email and password. They will leave the Residents list and appear
        under Administrators. You can limit which admin sections they can open.
      </p>
      {canAssignDev && (
        <div>
          <label className="text-sm font-medium">Role</label>
          <select
            name="role"
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            defaultValue="admin"
          >
            <option value="admin">Admin</option>
            <option value="dev">Dev</option>
          </select>
        </div>
      )}
      <AdminPermissionsFields defaultKeys={null} />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        Make this resident an administrator
      </label>
      <Button type="submit" disabled={pending || !confirm}>
        {pending ? "Updating…" : "Make admin"}
      </Button>
    </form>
  );
}
