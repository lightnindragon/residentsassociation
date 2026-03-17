import Link from "next/link";
import { getSql } from "@/lib/db";
import { Card, CardHeader, CardContent } from "@/components/ui";

export default async function ForumPage() {
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
  }> = [];
  try {
    const sql = getSql();
    categories = (await sql`
      SELECT id, name, slug, description, sort_order
      FROM forum_categories
      ORDER BY sort_order ASC, name ASC
    `) as typeof categories;
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Forum
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Community discussion. Choose a category to view threads.
      </p>
      <div className="mt-10 flex flex-col gap-4">
        {categories.length === 0 ? (
          <p className="text-[var(--color-muted)]">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <Link key={c.id} href={`/forum/${c.slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>{c.name}</CardHeader>
                <CardContent>
                  {c.description || "No description."}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
