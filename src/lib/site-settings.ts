import { getSql } from "@/lib/db";

export type SiteSettings = {
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
};

const empty: SiteSettings = {
  facebook_url: null,
  twitter_url: null,
  instagram_url: null,
  youtube_url: null,
  linkedin_url: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT facebook_url, twitter_url, instagram_url, youtube_url, linkedin_url
      FROM site_settings WHERE id = 1 LIMIT 1
    `;
    const r = rows[0] as SiteSettings | undefined;
    return r ?? empty;
  } catch {
    return empty;
  }
}
