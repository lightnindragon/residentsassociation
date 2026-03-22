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
  }> = [];
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT id, name, slug, description, sort_order
      FROM forum_areas
      ORDER BY sort_order ASC, name ASC
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
              <Card className="h-full border-[var(--color-border)] transition-shadow hover:shadow-md">
                <CardHeader className="text-xl">{a.name}</CardHeader>
                <CardContent className="text-sm text-[var(--color-muted)]">
                  {a.description || "Open area"}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
