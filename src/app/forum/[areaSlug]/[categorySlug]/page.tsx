import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { CreateThreadForm } from "./CreateThreadForm";
import { auth } from "@/lib/auth";
import { isFollowing } from "@/app/forum/actions/follow";
import { ForumFollowButton } from "@/components/ForumFollowButton";

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
    reply_count: number;
    unread: boolean;
    last_reply_at: string | null;
    last_reply_author: string | null;
  };
  let area: AreaRow | null = null;
  let category: CategoryRow | null = null;
  let threads: ThreadRow[] = [];
  
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? "";

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
          SELECT t.id, t.title, t.created_at, t.pinned, t.locked,
            CASE WHEN u.role IN ('admin', 'dev') THEN 'Admin'
                 ELSE COALESCE(u.forum_username, u.name) END AS author_name,
            (SELECT COUNT(*)::int FROM forum_posts WHERE thread_id = t.id) AS reply_count,
            (SELECT MAX(created_at) FROM forum_posts WHERE thread_id = t.id) AS last_reply_at,
            (SELECT CASE WHEN lu.role IN ('admin', 'dev') THEN 'Admin' ELSE COALESCE(lu.forum_username, lu.name) END 
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
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
      <CreateThreadForm categoryId={category.id} />
      <ul className="mt-8 space-y-2">
        {threads.length === 0 ? (
          <li className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center text-[var(--color-muted)]">
            No threads yet — start the first one above.
          </li>
        ) : (
          threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/forum/${areaSlug}/${categorySlug}/${t.id}`}
                className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-4 transition hover:border-[var(--color-primary)]/30 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {t.unread && <Badge variant="default" className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]">New</Badge>}
                  {t.pinned && <Badge variant="warning">Pinned</Badge>}
                  {t.locked && <Badge variant="muted">Locked</Badge>}
                  <span className={`font-medium ${t.unread ? "text-[var(--foreground)]" : "text-[var(--foreground)]/90"}`}>{t.title}</span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-[var(--color-muted)]">
                  <span>Started by {t.author_name ?? "Unknown"}</span>
                  {t.reply_count > 0 && (
                    <>
                      <span>·</span>
                      <span>{t.reply_count} {t.reply_count === 1 ? "reply" : "replies"}</span>
                    </>
                  )}
                  {t.last_reply_author && t.last_reply_at && (
                    <>
                      <span>·</span>
                      <span>Last reply by <span className="font-medium text-[var(--foreground)]">{t.last_reply_author}</span> at {new Date(t.last_reply_at).toLocaleString()}</span>
                    </>
                  )}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
