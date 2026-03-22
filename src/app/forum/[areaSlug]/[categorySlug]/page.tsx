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
  };
  let area: AreaRow | null = null;
  let category: CategoryRow | null = null;
  let threads: ThreadRow[] = [];
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
            (SELECT COUNT(*)::int FROM forum_posts WHERE thread_id = t.id) AS reply_count
          FROM forum_threads t
          LEFT JOIN users u ON u.id = t.author_id
          WHERE t.category_id = ${category.id}
          ORDER BY t.pinned DESC, t.created_at DESC
          LIMIT 100
        `;
        threads = threadRows as ThreadRow[];
      }
    }
  } catch {
    // no DB
  }
  if (!area || !category) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? "";
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
                  {t.pinned && <Badge variant="warning">Pinned</Badge>}
                  {t.locked && <Badge variant="muted">Locked</Badge>}
                  <span className="font-medium text-[var(--foreground)]">{t.title}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {t.author_name ?? "Unknown"} · {new Date(t.created_at).toLocaleDateString()}
                  {t.reply_count > 0 && ` · ${t.reply_count} ${t.reply_count === 1 ? "reply" : "replies"}`}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
