"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAdminUser, deleteAdminUser } from "@/app/admin/actions/admins";
import { Input, Button } from "@/components/ui";
import { ResetAdminPasswordForm } from "./ResetAdminPasswordForm";

type Admin = { id: string; name: string; email: string; role: string };

export function AdminRow({ admin }: { admin: Admin }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, start] = useTransition();

  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState(admin.role);

  if (isEditing) {
    return (
      <li className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="dev">Dev</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
          <ResetAdminPasswordForm userId={admin.id} />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-sm font-medium text-red-600 hover:underline mr-2"
              disabled={pending}
              onClick={() => {
                if (!confirm("Are you sure you want to delete this administrator?")) return;
                start(async () => {
                  const r = await deleteAdminUser(admin.id);
                  if (r.ok) {
                    toast.success("Administrator deleted.");
                  } else {
                    toast.error(r.error || "Failed to delete.");
                  }
                });
              }}
            >
              Delete
            </button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                setIsEditing(false);
                setName(admin.name);
                setEmail(admin.email);
                setRole(admin.role);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                start(async () => {
                  const r = await updateAdminUser(admin.id, { name, email, role });
                  if (r.ok) {
                    toast.success("Administrator updated.");
                    setIsEditing(false);
                  } else {
                    toast.error(r.error || "Failed to update.");
                  }
                });
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{admin.name}</p>
        <p className="text-sm text-[var(--color-muted)]">
          {admin.email} · {admin.role}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Edit
        </button>
      </div>
    </li>
  );
}
