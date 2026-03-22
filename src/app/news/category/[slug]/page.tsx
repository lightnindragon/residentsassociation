import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewsCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  type Cat = { id: string; name: string; slug: string };
  type Post = { id: string; title: string; slug: string; excerpt: string | null; published_at: string };
  let cat: Cat | null = null;
  let posts: Post[] = [];
  try {
    const sql = getSql();
    const cRows = await sql`
      SELECT id, name, slug FROM post_categories WHERE slug = ${slug} LIMIT 1
    `;
    cat = (cRows[0] as Cat) ?? null;
    if (cat) {
      posts = (await sql`
        SELECT id, title, slug, excerpt, published_at::text
        FROM posts
        WHERE post_category_id = ${cat.id}::uuid
          AND published_at IS NOT NULL AND published_at <= NOW()
        ORDER BY published_at DESC
        LIMIT 100
      `) as Post[];
    }
  } catch {
    // no DB
  }
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/news" className="text-sm text-[var(--color-primary)] hover:underline">
        ← All news
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold">{cat.name}</h1>
      <ul className="mt-8 space-y-4">
        {posts.length === 0 ? (
          <li className="text-[var(--color-muted)]">No posts in this category yet.</li>
        ) : (
          posts.map((p) => (
            <li key={p.id}>
              <Link href={`/news/${p.slug}`} className="block rounded-lg border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)]/40">
                <span className="font-medium text-[var(--foreground)]">{p.title}</span>
                {p.excerpt && <p className="mt-1 text-sm text-[var(--color-muted)]">{p.excerpt}</p>}
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
