import { getSql } from "@/lib/db";

export async function getCategoryForumPath(categoryId: string): Promise<{
  areaSlug: string;
  categorySlug: string;
} | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT a.slug AS area_slug, c.slug AS category_slug
      FROM forum_categories c
      JOIN forum_areas a ON a.id = c.area_id
      WHERE c.id = ${categoryId}::uuid
      LIMIT 1
    `;
    const r = rows[0] as { area_slug: string; category_slug: string } | undefined;
    if (!r) return null;
    return { areaSlug: r.area_slug, categorySlug: r.category_slug };
  } catch {
    return null;
  }
}

export function forumCategoryUrl(areaSlug: string, categorySlug: string) {
  return `/forum/${areaSlug}/${categorySlug}`;
}

export function forumThreadUrl(areaSlug: string, categorySlug: string, threadId: string) {
  return `/forum/${areaSlug}/${categorySlug}/${threadId}`;
}
