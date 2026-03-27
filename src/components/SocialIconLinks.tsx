import type { SiteSettings } from "@/lib/site-settings";

const linkClassDefault =
  "text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:underline text-sm";
const linkClassFooter =
  "text-white/70 hover:text-white hover:underline text-sm transition-colors";

export function hasNonFacebookSocialLinks(settings: SiteSettings): boolean {
  return !!(
    settings.twitter_url ||
    settings.instagram_url ||
    settings.youtube_url ||
    settings.linkedin_url
  );
}

/** Text links for non-Facebook networks (Facebook uses `FacebookIconLink`). */
export function SocialIconLinks({
  settings,
  variant = "default",
}: {
  settings: SiteSettings;
  variant?: "default" | "footer";
}) {
  const items: Array<{ href: string; label: string }> = [];
  if (settings.twitter_url) items.push({ href: settings.twitter_url, label: "X (Twitter)" });
  if (settings.instagram_url) items.push({ href: settings.instagram_url, label: "Instagram" });
  if (settings.youtube_url) items.push({ href: settings.youtube_url, label: "YouTube" });
  if (settings.linkedin_url) items.push({ href: settings.linkedin_url, label: "LinkedIn" });
  if (!items.length) return null;
  const linkClass = variant === "footer" ? linkClassFooter : linkClassDefault;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((i) => (
        <a key={i.label} href={i.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {i.label}
        </a>
      ))}
    </div>
  );
}
