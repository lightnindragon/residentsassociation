import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { ReplyForm } from "./ReplyForm";

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ categorySlug: string; threadId: string }>;
}) {
  const { categorySlug, threadId } = await params;
  const session = await auth();
  type CategoryRow = { id: string; name: string; slug: string };
  type ThreadRow = { id: string; title: string; created_at: string; locked: boolean; pinned: boolean; author_name: string | null };
  type PostRow = { id: string; body: string; created_at: string; author_name: string | null };
  let category: CategoryRow | null = null;
  let thread: ThreadRow | null = null;
  let posts: PostRow[] = [];
  try {
    const sql = getSql();
    const catRows = await sql`
      SELECT id, name, slug FROM forum_categories WHERE slug = ${categorySlug} LIMIT 1
    `;
    category = (catRows[0] as CategoryRow) ?? null;
    if (category) {
      const threadRows = await sql`
        SELECT t.id, t.title, t.created_at, t.locked, t.pinned, u.name AS author_name
        FROM forum_threads t
        LEFT JOIN users u ON u.id = t.author_id
        WHERE t.id = ${threadId}::uuid AND t.category_id = ${category.id}
        LIMIT 1
      `;
      thread = (threadRows[0] as ThreadRow) ?? null;
      if (thread) {
        const postRows = await sql`
          SELECT p.id, p.body, p.created_at, u.name AS author_name
          FROM forum_posts p
          LEFT JOIN users u ON u.id = p.author_id
          WHERE p.thread_id = ${threadId}::uuid
          ORDER BY p.created_at ASC
        `;
        posts = postRows as PostRow[];
      }
    }
  } catch {
    // no DB
  }
  if (!category || !thread) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href={`/forum/${categorySlug}`} className="text-sm text-[var(--color-primary)] hover:underline">
        ← {category.name}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-2xl font-semibold">{thread.title}</h1>
        {thread.pinned && <Badge variant="warning">Pinned</Badge>}
        {thread.locked && <Badge variant="muted">Locked</Badge>}
      </div>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Started by {thread.author_name ?? "Unknown"} ·{" "}
        {new Date(thread.created_at).toLocaleString()}
      </p>

      <ul className="mt-8 divide-y divide-[var(--color-border)]">
        {posts.map((p) => (
          <li key={p.id} className="py-6">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {p.author_name ?? "Unknown"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {new Date(p.created_at).toLocaleString()}
            </p>
            <div className="mt-2 whitespace-pre-wrap text-[var(--foreground)]">
              {p.body}
            </div>
          </li>
        ))}
      </ul>

      {session?.user && !thread.locked && (
        <ReplyForm threadId={threadId} />
      )}
    </div>
  );
}
