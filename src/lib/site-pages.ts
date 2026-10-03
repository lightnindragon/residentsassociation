import { getSql } from "@/lib/db";

export const RESERVED_PAGE_SLUGS = new Set([
  "about",
  "acceptable-use",
  "account",
  "admin",
  "agendas",
  "api",
  "contact",
  "cookies",
  "documents",
  "events",
  "forum",
  "gallery",
  "login",
  "minutes",
  "news",
  "planning-applications",
  "privacy",
  "reset-password",
  "signup",
  "terms",
  "website-disclaimer",
]);

export type SitePageOption = { label: string; href: string };

export function slugifyPageTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizePageSlug(raw: string): string | null {
  const slug = slugifyPageTitle(raw);
  if (!slug) return null;
  if (RESERVED_PAGE_SLUGS.has(slug)) return null;
  return slug;
}

export async function getPublishedSitePageOptions(): Promise<SitePageOption[]> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT title, slug FROM site_pages
      WHERE published_at IS NOT NULL AND published_at <= NOW()
      ORDER BY title
    `;
    return (rows as { title: string; slug: string }[]).map((row) => ({
      label: row.title,
      href: `/${row.slug}`,
    }));
  } catch {
    return [];
  }
}
