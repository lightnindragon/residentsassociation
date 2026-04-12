import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { NewsPostForm } from "../../NewsPostForm";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  const { id } = await params;
  type PostRow = {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    published_at: string | null;
    post_category_id: string | null;
    cover_image_url: string | null;
    archived_at: string | null;
  };
  let post: PostRow | null = null;
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, excerpt, body, published_at, post_category_id, cover_image_url, archived_at
      FROM posts WHERE id = ${id}::uuid LIMIT 1
    `;
    post = (rows[0] as PostRow) ?? null;
    categories = (await sql`
      SELECT id, name, slug FROM post_categories ORDER BY sort_order, name
    `) as typeof categories;
  } catch {
    // no DB
  }
  if (!post) notFound();

  return (
    <div>
      <Link
        href="/admin/news"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← News
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Edit Post</h1>
      {post.archived_at && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          This post is <strong>archived</strong> and hidden from the public news pages, home, and
          categories. Unarchive it from the{" "}
          <Link href="/admin/news?filter=archived" className="font-medium underline">
            Archived
          </Link>{" "}
          tab on the news list.
        </p>
      )}
      <NewsPostForm authorId={user.id} categories={categories} post={post} />
    </div>
  );
}
