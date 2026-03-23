import Link from "next/link";
import { getSql } from "@/lib/db";
import { Card, CardHeader, CardContent } from "@/components/ui";

export default async function ForumPage() {
  let areas: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    category_count: number;
  }> = [];
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT a.id, a.name, a.slug, a.description, a.sort_order,
        (SELECT COUNT(*)::int FROM forum_categories WHERE area_id = a.id) AS category_count
      FROM forum_areas a
      ORDER BY a.sort_order ASC, a.name ASC
    `) as typeof areas;
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        Forum
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
        Browse by area, then pick a category to join the conversation.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {areas.length === 0 ? (
          <p className="text-[var(--color-muted)]">No forum areas yet.</p>
        ) : (
          areas.map((a) => (
            <Link key={a.id} href={`/forum/${a.slug}`}>
              <Card className="flex h-full flex-col border-[var(--color-border)] transition-shadow hover:border-[var(--color-primary)]/40 hover:shadow-md">
                <CardHeader className="text-xl font-semibold pb-2">{a.name}</CardHeader>
                <CardContent className="flex-1 text-sm text-[var(--color-muted)] flex flex-col justify-between">
                  <p className="mb-4">{a.description || "Open area"}</p>
                  <div className="border-t border-[var(--color-border)] pt-3 text-xs font-medium text-[var(--foreground)]">
                    {a.category_count} {a.category_count === 1 ? "category" : "categories"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
