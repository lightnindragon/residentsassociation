"use client";

import { useActionState } from "react";
import { saveSocialLinks } from "@/app/admin/actions/site-settings";
import { Input, Button } from "@/components/ui";
import type { SiteSettings } from "@/lib/site-settings";

export function SocialSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(saveSocialLinks, null);
  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-3">
      <Input label="Facebook URL" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
      <Input label="X (Twitter) URL" name="twitter_url" defaultValue={settings.twitter_url ?? ""} />
      <Input label="Instagram URL" name="instagram_url" defaultValue={settings.instagram_url ?? ""} />
      <Input label="YouTube URL" name="youtube_url" defaultValue={settings.youtube_url ?? ""} />
      <Input label="LinkedIn URL" name="linkedin_url" defaultValue={settings.linkedin_url ?? ""} />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Saved.</p>}
      <Button type="submit">Save</Button>
    </form>
  );
}
