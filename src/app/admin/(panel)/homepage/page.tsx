import { getHomeHeroImageUrl, getHomePageContent } from "@/lib/site-content";
import { HomePageContentForm } from "./HomePageContentForm";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const [content, heroImageUrl] = await Promise.all([getHomePageContent(), getHomeHeroImageUrl()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Homepage</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Edit the hero image, hero text, and the &quot;Get involved&quot; section on the public homepage.
      </p>
      <HomePageContentForm initialContent={content} initialHeroUrl={heroImageUrl} />
    </div>
  );
}
