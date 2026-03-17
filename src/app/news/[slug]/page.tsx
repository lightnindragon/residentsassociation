import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  type PostRow = {
    id: string;
    title: string;
    slug: string;
    body: string;
    published_at: string | null;
    created_at: string;
    author_name: string | null;
  };
  let post: PostRow | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT p.id, p.title, p.slug, p.body, p.published_at, p.created_at, u.name AS author_name
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      WHERE p.slug = ${slug} AND p.published_at IS NOT NULL AND p.published_at <= NOW()
      LIMIT 1
    `;
    post = (rows[0] as PostRow) ?? null;
  } catch {
    // no DB
  }
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/news"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← News
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold text-[var(--foreground)]">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString()
          : new Date(post.created_at).toLocaleDateString()}
        {post.author_name && ` · ${post.author_name}`}
      </p>
      <div
        className="prose mt-8 max-w-none text-[var(--foreground)] prose-p:text-[var(--foreground)]"
        dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br>") }}
      />
    </article>
  );
}
