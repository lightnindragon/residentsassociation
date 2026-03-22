import { getSql } from "@/lib/db";

export type HeaderNewsCategory = { slug: string; name: string };

export async function getHeaderNewsCategories(): Promise<HeaderNewsCategory[]> {
  try {
    const sql = getSql();
    return (await sql`
      SELECT slug, name FROM post_categories
      WHERE show_in_header = true
      ORDER BY sort_order ASC, name ASC
    `) as HeaderNewsCategory[];
  } catch {
    return [];
  }
}
