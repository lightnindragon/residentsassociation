import Link from "next/link";
import { getSql } from "@/lib/db";
import { Card, CardHeader, CardContent } from "@/components/ui";

export default async function NewsPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    posts = (await sql`
      SELECT id, title, slug, excerpt, published_at, created_at
      FROM posts
      WHERE published_at IS NOT NULL AND published_at <= NOW()
      ORDER BY published_at DESC
      LIMIT 50
    `) as typeof posts;
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold text-[var(--foreground)]">
        Latest news
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">
        Community updates and announcements from the residents association.
      </p>
      <div className="mt-10 flex flex-col gap-6">
        {posts.length === 0 ? (
          <p className="text-[var(--color-muted)]">No news posts yet.</p>
        ) : (
          posts.map((p) => (
            <Link key={p.id} href={`/news/${p.slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>{p.title}</CardHeader>
                <CardContent>
                  {p.excerpt || "No excerpt."}
                  <span className="mt-2 block text-xs text-[var(--color-muted)]">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString()
                      : new Date(p.created_at).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
