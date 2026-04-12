import { getSql } from "@/lib/db";

/** Official Residents Facebook URL — icon in header & footer when DB value is empty. */
export const DEFAULT_FACEBOOK_GROUP_URL =
  "https://www.facebook.com/groups/879646087959298";

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

function normalizeOptionalUrl(v: string | null | undefined): string | null {
  const t = v?.trim();
  return t || null;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT facebook_url, twitter_url, instagram_url, youtube_url, linkedin_url
      FROM site_settings WHERE id = 1 LIMIT 1
    `;
    const r = rows[0] as SiteSettings | undefined;
    if (!r) {
      return {
        ...empty,
        facebook_url: DEFAULT_FACEBOOK_GROUP_URL,
      };
    }
    return {
      facebook_url: normalizeOptionalUrl(r.facebook_url) ?? DEFAULT_FACEBOOK_GROUP_URL,
      twitter_url: normalizeOptionalUrl(r.twitter_url),
      instagram_url: normalizeOptionalUrl(r.instagram_url),
      youtube_url: normalizeOptionalUrl(r.youtube_url),
      linkedin_url: normalizeOptionalUrl(r.linkedin_url),
    };
  } catch {
    return {
      ...empty,
      facebook_url: DEFAULT_FACEBOOK_GROUP_URL,
    };
  }
}
