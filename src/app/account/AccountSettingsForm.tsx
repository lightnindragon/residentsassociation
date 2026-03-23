"use client";

import { useActionState } from "react";
import { updateAccountSettings } from "@/app/actions/account-settings";
import { Input, Button } from "@/components/ui";
import Image from "next/image";

export function AccountSettingsForm({
  initial,
  isResident,
}: {
  initial: {
    forum_username: string | null;
    forum_town: string | null;
    notify_new_blog: boolean;
    forum_emails_enabled: boolean;
    avatar_url?: string | null;
  };
  isResident: boolean;
}) {
  const [state, formAction] = useActionState(updateAccountSettings, null);
  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {initial.avatar_url ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-card)]">
            <Image src={initial.avatar_url} alt="Avatar" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-card)] text-sm text-[var(--color-muted)]">
            No image
          </div>
        )}
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Profile Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="block w-full text-sm text-[var(--color-muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-primary)]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
          />
        </div>
      </div>

      <Input
        label="Forum display name"
        name="forum_username"
        defaultValue={initial.forum_username ?? ""}
        placeholder="Shown next to your posts"
      />
      <Input
        label="Hometown (forum)"
        name="forum_town"
        defaultValue={initial.forum_town ?? ""}
        placeholder="e.g. Culcheth"
      />
      {isResident && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="notify_new_blog" value="1" defaultChecked={initial.notify_new_blog} />
          Email me when a new blog article is published
        </label>
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="forum_emails_enabled"
          value="1"
          defaultChecked={initial.forum_emails_enabled !== false}
        />
        Forum email notifications (new threads / replies you follow)
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Saved.</p>}
      <Button type="submit">Save preferences</Button>
    </form>
  );
}
