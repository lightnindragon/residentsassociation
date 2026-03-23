"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Button } from "@/components/ui";
import { updateResident, resetResidentPassword, setUserBanned, triggerPasswordReset } from "@/app/admin/actions/residents";

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
    banned_until?: Date | null;
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [pw, setPw] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");

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
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await triggerPasswordReset(user.id);
                if (r.ok) {
                  toast.success("Password reset email sent.");
                } else toast.error(r.error ?? "Failed to send email.");
              })
            }
          >
            Send password reset email
          </Button>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-6">
        <h2 className="font-heading text-sm font-semibold">Forum / site access</h2>
        {user.banned && user.banned_until ? (
          <p className="mt-1 text-xs text-red-500 mb-3">
            Banned until: {new Date(user.banned_until).toLocaleString()}
          </p>
        ) : user.banned ? (
          <p className="mt-1 text-xs text-red-500 mb-3">Permanently banned</p>
        ) : null}
        
        <div className="mt-2 flex items-center gap-3">
          {!user.banned && (
            <select
              value={banDuration}
              onChange={(e) => setBanDuration(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
            >
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="permanent">Permanent</option>
            </select>
          )}
          <button
            type="button"
            disabled={pending}
            className="rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            onClick={() =>
              start(async () => {
                let bannedUntil = null;
                if (!user.banned && banDuration !== "permanent") {
                  const now = new Date();
                  if (banDuration === "1h") bannedUntil = new Date(now.getTime() + 60 * 60 * 1000);
                  if (banDuration === "1d") bannedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                  if (banDuration === "1w") bannedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                }
                const r = await setUserBanned(user.id, !user.banned, bannedUntil);
                if (r.ok) {
                  toast.success(user.banned ? "Unbanned." : "User banned.");
                  router.refresh();
                } else toast.error("Update failed.");
              })
            }
          >
            {user.banned ? "Unban user" : "Ban user"}
          </button>
        </div>
      </div>
    </div>
  );
}
