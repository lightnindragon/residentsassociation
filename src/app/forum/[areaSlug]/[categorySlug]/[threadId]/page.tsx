import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { ReplyForm } from "./ReplyForm";
import { ThreadModeration } from "./ThreadModeration";
import { DeletePostButton } from "./DeletePostButton";
import { BanUserButton } from "./BanUserButton";
import { ForumFollowButton } from "@/components/ForumFollowButton";
import { isFollowing } from "@/app/forum/actions/follow";

export default async function ForumThreadPage({
  params,
}: {
  params: Promise<{ areaSlug: string; categorySlug: string; threadId: string }>;
}) {
  const { areaSlug, categorySlug, threadId } = await params;
  const session = await auth();
  const user = session?.user as { role?: string; id?: string } | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "dev";

  type AreaRow = { id: string; name: string; slug: string };
  type CategoryRow = { id: string; name: string; slug: string };
  type ThreadRow = {
    id: string;
    title: string;
    created_at: string;
    locked: boolean;
    pinned: boolean;
    author_id: string;
    author_role: string | null;
    author_name: string | null;
    author_town: string | null;
  };
  type PostRow = {
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    author_role: string | null;
    author_name: string | null;
    author_town: string | null;
  };

  let area: AreaRow | null = null;
  let category: CategoryRow | null = null;
  let thread: ThreadRow | null = null;
  let posts: PostRow[] = [];

  try {
    const sql = getSql();
    const aRows = await sql`SELECT id, name, slug FROM forum_areas WHERE slug = ${areaSlug} LIMIT 1`;
    area = (aRows[0] as AreaRow) ?? null;
    if (area) {
      const catRows = await sql`
        SELECT id, name, slug FROM forum_categories
        WHERE slug = ${categorySlug} AND area_id = ${area.id}
        LIMIT 1
      `;
      category = (catRows[0] as CategoryRow) ?? null;
      if (category) {
        const threadRows = await sql`
          SELECT t.id, t.title, t.created_at, t.locked, t.pinned, t.author_id, u.role AS author_role,
            CASE WHEN u.role IN ('admin', 'dev') THEN 'Admin'
                 ELSE COALESCE(u.forum_username, u.name) END AS author_name,
            CASE WHEN u.role IN ('admin', 'dev') THEN NULL ELSE u.forum_town END AS author_town
          FROM forum_threads t
          LEFT JOIN users u ON u.id = t.author_id
          WHERE t.id = ${threadId}::uuid AND t.category_id = ${category.id}
          LIMIT 1
        `;
        thread = (threadRows[0] as ThreadRow) ?? null;
        if (thread) {
          const postRows = await sql`
            SELECT p.id, p.body, p.created_at, p.author_id, u.role AS author_role,
              CASE WHEN u.role IN ('admin', 'dev') THEN 'Admin'
                   ELSE COALESCE(u.forum_username, u.name) END AS author_name,
              CASE WHEN u.role IN ('admin', 'dev') THEN NULL ELSE u.forum_town END AS author_town
            FROM forum_posts p
            LEFT JOIN users u ON u.id = p.author_id
            WHERE p.thread_id = ${threadId}::uuid
            ORDER BY p.created_at ASC
          `;
          posts = postRows as PostRow[];
        }
      }
    }
  } catch {
    // no DB
  }

  if (!area || !category || !thread) notFound();

  const followingThread = session?.user?.id ? await isFollowing("thread", threadId) : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link href="/forum" className="text-[var(--color-primary)] hover:underline">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/forum/${areaSlug}`} className="text-[var(--color-primary)] hover:underline">
          {area.name}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/forum/${areaSlug}/${categorySlug}`}
          className="text-[var(--color-primary)] hover:underline"
        >
          {category.name}
        </Link>
      </nav>

      <header className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
                {thread.title}
              </h1>
              {thread.pinned && <Badge variant="warning">Pinned</Badge>}
              {thread.locked && <Badge variant="muted">Locked</Badge>}
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Started by{" "}
              <span className="font-medium text-[var(--foreground)]">
                {thread.author_name ?? "Unknown"}
              </span>
              {thread.author_town && ` · ${thread.author_town}`}
              {" · "}
              {new Date(thread.created_at).toLocaleString()}
            </p>
          </div>
          {session?.user?.id && (
            <ForumFollowButton
              targetType="thread"
              targetId={threadId}
              userId={session.user.id}
              initialFollowing={followingThread}
            />
          )}
        </div>
        {isAdmin && (
          <>
            <ThreadModeration threadId={threadId} pinned={thread.pinned} locked={thread.locked} />
            {thread.author_role === "user" && (
              <BanUserButton targetUserId={thread.author_id} />
            )}
          </>
        )}
      </header>

      <ul className="mt-8 space-y-4">
        {posts.map((p, i) => (
          <li
            key={p.id}
            className={`rounded-2xl border border-[var(--color-border)] p-5 ${
              i === 0 ? "bg-[var(--color-primary)]/[0.04] ring-1 ring-[var(--color-primary)]/15" : "bg-[var(--color-card)]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-[var(--foreground)]">
                    {p.author_name ?? "Unknown"}
                  </span>
                  {p.author_town && (
                    <span className="text-sm text-[var(--color-muted)]">{p.author_town}</span>
                  )}
                  {i === 0 && (
                    <Badge variant="muted" className="text-[10px]">
                      OP
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                  {new Date(p.created_at).toLocaleString()}
                </p>
                <div className="mt-3 whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
                  {p.body}
                </div>
              </div>
              {isAdmin && (
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <DeletePostButton postId={p.id} threadId={threadId} />
                  {p.author_role === "user" && (
                    <BanUserButton targetUserId={p.author_id} />
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {session?.user && !thread.locked && <ReplyForm threadId={threadId} />}
    </div>
  );
}
