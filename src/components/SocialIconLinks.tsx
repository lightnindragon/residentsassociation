import type { SiteSettings } from "@/lib/site-settings";

const linkClass =
  "text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:underline text-sm";

export function SocialIconLinks({ settings }: { settings: SiteSettings }) {
  const items: Array<{ href: string; label: string }> = [];
  if (settings.facebook_url) items.push({ href: settings.facebook_url, label: "Facebook" });
  if (settings.twitter_url) items.push({ href: settings.twitter_url, label: "X (Twitter)" });
  if (settings.instagram_url) items.push({ href: settings.instagram_url, label: "Instagram" });
  if (settings.youtube_url) items.push({ href: settings.youtube_url, label: "YouTube" });
  if (settings.linkedin_url) items.push({ href: settings.linkedin_url, label: "LinkedIn" });
  if (!items.length) return null;
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
