import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { ReplyForm } from "./ReplyForm";
import { ThreadModeration } from "./ThreadModeration";
import { DeletePostButton } from "./DeletePostButton";
import { BanUserButton } from "./BanUserButton";
import { QuoteButton } from "./QuoteButton";
import { LikeButton } from "./LikeButton";
import { ForumFollowButton } from "@/components/ForumFollowButton";
import { isFollowing } from "@/app/forum/actions/follow";
import { formatUkDateTime } from "@/lib/date-format";

import Image from "next/image";

export default async function ForumThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ areaSlug: string; categorySlug: string; threadId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { areaSlug, categorySlug, threadId } = await params;
  const { page } = await searchParams;
  const session = await auth();
  const user = session?.user as { role?: string; id?: string } | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "dev";

  const postsPerPage = 20;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * postsPerPage;

  type AreaRow = { id: string; name: string; slug: string };
  type CategoryRow = { id: string; name: string; slug: string };
  type ThreadRow = {
    id: string;
    title: string;
    created_at: string;
    locked: boolean;
    pinned: boolean;
    admin_only: boolean;
    author_id: string;
    author_role: string | null;
    author_name: string | null;
    author_town: string | null;
    author_avatar: string | null;
  };
  type PostRow = {
    id: string;
    body: string;
    created_at: string;
    author_id: string;
    author_role: string | null;
    author_name: string | null;
    author_town: string | null;
    author_avatar: string | null;
    like_count: number;
    user_liked: boolean;
  };

  let area: AreaRow | null = null;
  let category: CategoryRow | null = null;
  let thread: ThreadRow | null = null;
  let posts: PostRow[] = [];
  let totalPosts = 0;

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
          SELECT t.id, t.title, t.created_at, t.locked, t.pinned, t.admin_only, t.author_id, u.role AS author_role, u.avatar_url AS author_avatar,
            COALESCE(u.forum_username, u.name) AS author_name,
            u.forum_town AS author_town
          FROM forum_threads t
          LEFT JOIN users u ON u.id = t.author_id
          WHERE t.id = ${threadId}::uuid AND t.category_id = ${category.id}
          LIMIT 1
        `;
        thread = (threadRows[0] as ThreadRow) ?? null;
        if (thread) {
          if (session?.user?.id) {
            // Update thread view
            await sql`
              INSERT INTO forum_thread_views (user_id, thread_id, last_viewed_at)
              VALUES (${session.user.id}::uuid, ${threadId}::uuid, NOW())
              ON CONFLICT (user_id, thread_id) DO UPDATE SET last_viewed_at = NOW()
            `;
          }

          const countRow = await sql`SELECT COUNT(*)::int as count FROM forum_posts WHERE thread_id = ${threadId}::uuid`;
          totalPosts = countRow[0]?.count ?? 0;

          const postRows = await sql`
            SELECT p.id, p.body, p.created_at, p.author_id, u.role AS author_role, u.avatar_url AS author_avatar,
              COALESCE(u.forum_username, u.name) AS author_name,
              u.forum_town AS author_town,
              (SELECT COUNT(*)::int FROM forum_post_likes WHERE post_id = p.id) AS like_count,
              EXISTS(SELECT 1 FROM forum_post_likes WHERE post_id = p.id AND user_id = ${session?.user?.id ? session.user.id : null}::uuid) AS user_liked
            FROM forum_posts p
            LEFT JOIN users u ON u.id = p.author_id
            WHERE p.thread_id = ${threadId}::uuid
            ORDER BY p.created_at ASC
            LIMIT ${postsPerPage} OFFSET ${offset}
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
    <div className="py-2 max-w-4xl">
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
              {thread.admin_only && (
                <span className="inline-flex items-center gap-1 rounded bg-[var(--color-primary)]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  📢 Announcements
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center flex-wrap gap-1.5 text-sm text-[var(--color-muted)]">
              Started by{" "}
              <span className="font-medium text-[var(--foreground)]">
                {thread.author_name ?? "Unknown"}
              </span>
              {(thread.author_role === "admin" || thread.author_role === "dev") && (
                <span className="inline-flex items-center rounded bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Admin
                </span>
              )}
              {thread.author_town && <span>· {thread.author_town}</span>}
              <span>·</span>
              <span>{formatUkDateTime(thread.created_at)}</span>
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
            <ThreadModeration threadId={threadId} pinned={thread.pinned} locked={thread.locked} adminOnly={thread.admin_only} />
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
              <div className="flex shrink-0">
                {p.author_avatar ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-card)]">
                    <Image src={p.author_avatar} alt={p.author_name ?? "User"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/10 text-xs font-semibold text-[var(--foreground)]">
                    {p.author_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-[var(--foreground)]">
                    {p.author_name ?? "Unknown"}
                  </span>
                  {(p.author_role === "admin" || p.author_role === "dev") && (
                    <span className="inline-flex items-center rounded bg-[var(--color-primary)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                      Admin
                    </span>
                  )}
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
                  {formatUkDateTime(p.created_at)}
                </p>
                <div className="mt-3 whitespace-pre-wrap text-[var(--foreground)] leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: p.body }}
                />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {session?.user && !thread.locked && (
                  <div className="flex items-center gap-1">
                    <LikeButton
                      postId={p.id}
                      initialLiked={p.user_liked}
                      initialCount={p.like_count}
                      pathToRevalidate={`/forum/${areaSlug}/${categorySlug}/${threadId}`}
                    />
                    <QuoteButton authorName={p.author_name ?? "Unknown"} htmlBody={p.body} />
                  </div>
                )}
                {isAdmin && (
                  <>
                    <DeletePostButton postId={p.id} threadId={threadId} />
                    {p.author_role === "user" && (
                      <BanUserButton targetUserId={p.author_id} />
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {totalPosts > postsPerPage && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(totalPosts / postsPerPage) }).map((_, i) => {
            const p = i + 1;
            const isCurrent = p === currentPage;
            return (
              <Link
                key={p}
                href={`/forum/${areaSlug}/${categorySlug}/${threadId}?page=${p}`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  isCurrent
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--foreground)] hover:border-[var(--color-primary)]/50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}

      {session?.user && !thread.locked && (
        thread.admin_only && !isAdmin ? (
          <p className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4 text-sm text-[var(--color-muted)]">
            📢 This is an announcements thread — only admins can post here.
          </p>
        ) : (
          <ReplyForm threadId={threadId} />
        )
      )}
    </div>
  );
}
