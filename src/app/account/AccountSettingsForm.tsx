"use client";

import { useActionState } from "react";
import { updateAccountSettings } from "@/app/actions/account-settings";
import { Input, Button } from "@/components/ui";

export function AccountSettingsForm({
  initial,
  isResident,
}: {
  initial: {
    forum_username: string | null;
    forum_town: string | null;
    notify_new_blog: boolean;
    forum_emails_enabled: boolean;
  };
  isResident: boolean;
}) {
  const [state, formAction] = useActionState(updateAccountSettings, null);
  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
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
