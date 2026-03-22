"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button } from "@/components/ui";
import { updateResident, resetResidentPassword, setUserBanned } from "@/app/admin/actions/residents";

export function ResidentEditForm({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    forum_username: string | null;
    forum_town: string | null;
    admin_notes: string | null;
    banned: boolean;
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pw, setPw] = useState("");

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await updateResident(user.id, {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        forum_username: String(fd.get("forum_username") ?? ""),
        forum_town: String(fd.get("forum_town") ?? ""),
        admin_notes: String(fd.get("admin_notes") ?? ""),
      });
      if (res.ok) {
        toast.success("Saved.");
        router.refresh();
      } else toast.error("Save failed.");
    });
  }

  return (
    <div className="mt-6 max-w-lg space-y-8">
      <form onSubmit={onSave} className="flex flex-col gap-3">
        <Input label="Name" name="name" defaultValue={user.name} required />
        <Input label="Email" name="email" type="email" defaultValue={user.email} required />
        <Input
          label="Forum display name"
          name="forum_username"
          defaultValue={user.forum_username ?? ""}
        />
        <Input label="Forum town" name="forum_town" defaultValue={user.forum_town ?? ""} />
        <div>
          <label className="block text-sm font-medium">Admin notes (internal)</label>
          <textarea
            name="admin_notes"
            rows={4}
            defaultValue={user.admin_notes ?? ""}
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </form>
      <div className="border-t border-[var(--color-border)] pt-6">
        <h2 className="font-heading text-sm font-semibold">Reset password</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">Min. 8 characters.</p>
        <div className="mt-2 flex gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            placeholder="New password"
          />
          <button
            type="button"
            disabled={pending}
            className="rounded bg-[var(--color-border)] px-3 py-2 text-sm"
            onClick={() =>
              start(async () => {
                const r = await resetResidentPassword(user.id, pw);
                if (r.ok) {
                  toast.success("Password updated.");
                  setPw("");
                } else toast.error(r.error ?? "Failed.");
              })
            }
          >
            Set
          </button>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-6">
        <h2 className="font-heading text-sm font-semibold">Forum / site access</h2>
        <button
          type="button"
          disabled={pending}
          className="mt-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          onClick={() =>
            start(async () => {
              const r = await setUserBanned(user.id, !user.banned);
              if (r.ok) {
                toast.success(user.banned ? "Unbanned." : "User banned from forum.");
                router.refresh();
              } else toast.error("Update failed.");
            })
          }
        >
          {user.banned ? "Unban user" : "Ban user (forum)"}
        </button>
      </div>
    </div>
  );
}
