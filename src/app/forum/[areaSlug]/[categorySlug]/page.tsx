import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { CreateThreadForm } from "./CreateThreadForm";
import { auth } from "@/lib/auth";
import { isFollowing } from "@/app/forum/actions/follow";
import { ForumFollowButton } from "@/components/ForumFollowButton";
import { formatUkDateTime } from "@/lib/date-format";

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ areaSlug: string; categorySlug: string }>;
}) {
  const { areaSlug, categorySlug } = await params;
  type AreaRow = { id: string; name: string; slug: string };
  type CategoryRow = { id: string; name: string; slug: string };
  type ThreadRow = {
    id: string;
    title: string;
    created_at: string;
    author_name: string | null;
    pinned: boolean;
    locked: boolean;
    admin_only: boolean;
    reply_count: number;
    unread: boolean;
    last_reply_at: string | null;
    last_reply_author: string | null;
  };
  let area: AreaRow | null = null;
  let category: CategoryRow | null = null;
  let threads: ThreadRow[] = [];
  
  const session = await auth();
  const sessionUser = session?.user as { id?: string; role?: string } | undefined;
  const userId = sessionUser?.id ?? "";
  const isAdmin = sessionUser?.role === "admin" || sessionUser?.role === "dev";

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
          SELECT t.id, t.title, t.created_at, t.pinned, t.locked, t.admin_only,
            COALESCE(u.forum_username, u.name) AS author_name,
            (SELECT COUNT(*)::int FROM forum_posts WHERE thread_id = t.id) AS reply_count,
            (SELECT MAX(created_at) FROM forum_posts WHERE thread_id = t.id) AS last_reply_at,
            (SELECT COALESCE(lu.forum_username, lu.name)
             FROM forum_posts lp 
             LEFT JOIN users lu ON lu.id = lp.author_id 
             WHERE lp.thread_id = t.id 
             ORDER BY lp.created_at DESC LIMIT 1) AS last_reply_author,
            CASE
              WHEN ${userId ? userId : null}::uuid IS NULL THEN false
              ELSE (
                t.updated_at > COALESCE(
                  (SELECT last_viewed_at FROM forum_thread_views WHERE thread_id = t.id AND user_id = ${userId ? userId : null}::uuid),
                  '1970-01-01'::timestamptz
                )
              )
            END AS unread
          FROM forum_threads t
          LEFT JOIN users u ON u.id = t.author_id
          WHERE t.category_id = ${category.id}
          ORDER BY t.pinned DESC, t.updated_at DESC
          LIMIT 100
        `;
        threads = threadRows as ThreadRow[];
      }
    }
  } catch {
    // no DB
  }
  if (!area || !category) notFound();

  const followingCategory = userId ? await isFollowing("category", category.id) : false;

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
        <span className="text-[var(--foreground)]">{category.name}</span>
      </nav>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {category.name}
      </h1>
      {userId && (
        <div className="mt-3">
          <ForumFollowButton
            targetType="category"
            targetId={category.id}
            userId={userId}
            initialFollowing={followingCategory}
          />
        </div>
      )}
      <CreateThreadForm categoryId={category.id} isAdmin={isAdmin} />
      <div className="mt-8 overflow-hidden rounded-md border border-[var(--color-primary)] bg-[var(--color-card)] shadow-sm">
        <div className="flex justify-between bg-[var(--color-primary)] px-4 py-2 text-xs font-bold uppercase text-white">
          <div className="flex-1">TOPICS</div>
          <div className="hidden w-20 text-center sm:block">REPLIES</div>
          <div className="hidden w-48 pl-4 sm:block">LAST POST</div>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {threads.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">No threads yet — start the first one above.</div>
          ) : (
            threads.map((t) => (
              <div key={t.id} className={`flex items-center px-4 py-3 transition-colors hover:bg-[var(--color-primary-muted)]/40 dark:hover:bg-[var(--color-muted)]/10 ${t.unread ? "bg-[var(--color-accent)]/10 dark:bg-[var(--color-card)]" : "bg-white dark:bg-[var(--background)]"}`}>
                <div className="mr-3 flex shrink-0 items-center justify-center">
                  <svg className={`h-8 w-8 ${t.unread ? "text-red-500" : "text-[var(--color-primary)] opacity-80"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/forum/${areaSlug}/${categorySlug}/${t.id}`} className={`text-base font-bold hover:underline ${t.unread ? "text-red-600 dark:text-red-400" : "text-[var(--color-primary)]"}`}>
                    {t.title}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    {t.admin_only && <Badge variant="info" className="px-1 py-0 text-[10px] uppercase">📢 Announcements</Badge>}
                    {t.pinned && <Badge variant="warning" className="px-1 py-0 text-[10px] uppercase">Pinned</Badge>}
                    {t.locked && <Badge variant="muted" className="px-1 py-0 text-[10px] uppercase">Locked</Badge>}
                    <span>by {t.author_name ?? "Unknown"}</span>
                  </div>
                </div>
                <div className="hidden w-20 text-center text-sm font-medium text-[var(--foreground)] sm:block">
                  {t.reply_count}
                </div>
                <div className="hidden w-48 pl-4 text-xs text-[var(--color-muted)] sm:block">
                  {t.last_reply_author && t.last_reply_at ? (
                    <>
                      by <span className="font-semibold text-[var(--foreground)]">{t.last_reply_author}</span>
                      <br />
                      {formatUkDateTime(t.last_reply_at)}
                    </>
                  ) : (
                    <>
                      by <span className="font-semibold text-[var(--foreground)]">{t.author_name ?? "Unknown"}</span>
                      <br />
                      {formatUkDateTime(t.created_at)}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
