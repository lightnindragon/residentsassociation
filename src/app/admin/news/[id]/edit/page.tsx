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
  };
  let post: PostRow | null = null;
  let admins: Array<{ id: string; name: string }> = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, excerpt, body, published_at FROM posts WHERE id = ${id}::uuid LIMIT 1
    `;
    post = (rows[0] as PostRow) ?? null;
    admins = (await sql`
      SELECT id, name FROM users WHERE role = 'admin' ORDER BY name
    `) as typeof admins;
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
      <h1 className="mt-4 font-heading text-2xl font-semibold">Edit post</h1>
      <NewsPostForm authorId={user.id} admins={admins} post={post} />
    </div>
  );
}
