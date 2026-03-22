"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const r = (session?.user as { role?: string })?.role;
  if (r !== "admin" && r !== "dev") throw new Error("Forbidden");
}

export async function saveSocialLinks(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const sql = getSql();
    const facebook_url = formData.get("facebook_url")?.toString()?.trim() || null;
    const twitter_url = formData.get("twitter_url")?.toString()?.trim() || null;
    const instagram_url = formData.get("instagram_url")?.toString()?.trim() || null;
    const youtube_url = formData.get("youtube_url")?.toString()?.trim() || null;
    const linkedin_url = formData.get("linkedin_url")?.toString()?.trim() || null;
    await sql`
      INSERT INTO site_settings (id, facebook_url, twitter_url, instagram_url, youtube_url, linkedin_url)
      VALUES (1, ${facebook_url}, ${twitter_url}, ${instagram_url}, ${youtube_url}, ${linkedin_url})
      ON CONFLICT (id) DO UPDATE SET
        facebook_url = EXCLUDED.facebook_url,
        twitter_url = EXCLUDED.twitter_url,
        instagram_url = EXCLUDED.instagram_url,
        youtube_url = EXCLUDED.youtube_url,
        linkedin_url = EXCLUDED.linkedin_url
    `;
    revalidatePath("/");
    revalidatePath("/admin/social");
    return { ok: true };
  } catch {
    return { error: "Could not save." };
  }
}
