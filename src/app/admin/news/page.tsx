import Link from "next/link";
import { getSql } from "@/lib/db";
import { DeletePostButton } from "./DeletePostButton";

export default async function AdminNewsPage() {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    posts = (await sql`
      SELECT id, title, slug, published_at, created_at
      FROM posts
      ORDER BY created_at DESC
      LIMIT 100
    `) as typeof posts;
  } catch {
    // no DB
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
          News posts
        </h1>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          New post
        </Link>
      </div>
      <p className="mt-1 text-[var(--color-muted)]">
        Create and manage news articles.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[400px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">Title</th>
              <th className="py-3 text-left font-medium">Status</th>
              <th className="py-3 text-left font-medium">Date</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[var(--color-muted)]">
                  No posts yet.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--color-border)]"
                >
                  <td className="py-3">
                    <Link
                      href={`/admin/news/${p.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3">
                    {p.published_at ? "Published" : "Draft"}
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/news/${p.id}/edit`}
                      className="mr-2 text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </Link>
                    <DeletePostButton postId={p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
