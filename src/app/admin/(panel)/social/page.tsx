import { getSiteSettings } from "@/lib/site-settings";
import { SocialSettingsForm } from "./SocialSettingsForm";

export default async function AdminSocialPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Social links</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Links open in a new tab from the header and footer. For Facebook, leave blank to use the
        default community group URL, or paste a different page or group link.
      </p>
      <SocialSettingsForm settings={settings} />
    </div>
  );
}
