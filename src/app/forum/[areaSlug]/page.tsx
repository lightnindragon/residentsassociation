import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isFollowing } from "@/app/forum/actions/follow";
import { ForumFollowButton } from "@/components/ForumFollowButton";

export default async function ForumAreaPage({
  params,
}: {
  params: Promise<{ areaSlug: string }>;
}) {
  const { areaSlug } = await params;
  type AreaRow = { id: string; name: string; slug: string; description: string | null };
  type CatRow = { 
    id: string; 
    name: string; 
    slug: string; 
    description: string | null; 
    sort_order: number;
    thread_count: number;
    post_count: number;
    latest_post_author: string | null;
    latest_post_date: string | null;
    latest_post_thread_id: string | null;
    latest_post_thread_title: string | null;
  };
  let area: AreaRow | null = null;
  let categories: CatRow[] = [];
  try {
    const sql = getSql();
    const aRows = await sql`
      SELECT id, name, slug, description FROM forum_areas WHERE slug = ${areaSlug} LIMIT 1
    `;
    area = (aRows[0] as AreaRow) ?? null;
    if (area) {
      const cRows = await sql`
        SELECT c.id, c.name, c.slug, c.description, c.sort_order,
          (SELECT COUNT(*)::int FROM forum_threads WHERE category_id = c.id) AS thread_count,
          (SELECT COUNT(*)::int FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE t.category_id = c.id) AS post_count,
          (SELECT p2.created_at FROM forum_posts p2 JOIN forum_threads t2 ON t2.id = p2.thread_id WHERE t2.category_id = c.id ORDER BY p2.created_at DESC LIMIT 1) AS latest_post_date,
          (SELECT COALESCE(lu.forum_username, lu.name)
           FROM forum_posts lp 
           JOIN forum_threads lt ON lt.id = lp.thread_id 
           LEFT JOIN users lu ON lu.id = lp.author_id 
           WHERE lt.category_id = c.id 
           ORDER BY lp.created_at DESC LIMIT 1) AS latest_post_author,
          (SELECT lt.id
           FROM forum_posts lp 
           JOIN forum_threads lt ON lt.id = lp.thread_id 
           WHERE lt.category_id = c.id 
           ORDER BY lp.created_at DESC LIMIT 1) AS latest_post_thread_id,
          (SELECT lt.title
           FROM forum_posts lp 
           JOIN forum_threads lt ON lt.id = lp.thread_id 
           WHERE lt.category_id = c.id 
           ORDER BY lp.created_at DESC LIMIT 1) AS latest_post_thread_title
        FROM forum_categories c
        WHERE c.area_id = ${area.id}
        ORDER BY c.sort_order ASC, c.name ASC
      `;
      categories = cRows as CatRow[];
    }
  } catch {
    // no DB
  }
  if (!area) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const followingArea = userId ? await isFollowing("area", area.id) : false;

  return (
    <div className="py-2">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link href="/forum" className="text-[#006699] hover:underline dark:text-[#4da6ff]">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{area.name}</span>
      </nav>
      
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {area.name}
          </h1>
          {area.description && (
            <p className="mt-1 text-[var(--color-muted)]">{area.description}</p>
          )}
        </div>
        {userId && (
          <ForumFollowButton
            targetType="area"
            targetId={area.id}
            userId={userId}
            initialFollowing={followingArea}
          />
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-md border border-[#006699] bg-[var(--color-card)] shadow-sm">
        <div className="flex justify-between bg-[#006699] px-4 py-2 text-xs font-bold uppercase text-white">
          <div className="flex-1">{area.name}</div>
          <div className="hidden w-20 text-center sm:block">TOPICS</div>
          <div className="hidden w-20 text-center sm:block">POSTS</div>
          <div className="hidden w-48 pl-4 sm:block">LAST POST</div>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {categories.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--color-muted)]">No categories in this area yet.</div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="flex items-center bg-[#fffdf0] px-4 py-3 transition-colors hover:bg-[#fff9e6] dark:bg-[var(--color-card)] dark:hover:bg-[var(--color-muted)]/10">
                <div className="mr-3 flex shrink-0 items-center justify-center">
                  <svg className="h-8 w-8 text-[#006699] opacity-70 dark:text-[#4da6ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 2v6h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h.01" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/forum/${areaSlug}/${c.slug}`} className="text-base font-bold text-[#006699] hover:underline dark:text-[#4da6ff]">
                    {c.name}
                  </Link>
                  {c.description && (
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{c.description}</p>
                  )}
                </div>
                <div className="hidden w-20 text-center text-sm font-medium text-[var(--foreground)] sm:block">
                  {c.thread_count}
                </div>
                <div className="hidden w-20 text-center text-sm font-medium text-[var(--foreground)] sm:block">
                  {c.post_count}
                </div>
                <div className="hidden w-48 pl-4 text-xs text-[var(--color-muted)] sm:block">
                  {c.latest_post_author && c.latest_post_date ? (
                    <>
                      {c.latest_post_thread_id && c.latest_post_thread_title && (
                        <Link href={`/forum/${areaSlug}/${c.slug}/${c.latest_post_thread_id}`} className="block font-semibold text-[#006699] hover:underline dark:text-[#4da6ff] truncate mb-0.5">
                          {c.latest_post_thread_title}
                        </Link>
                      )}
                      by <span className="font-medium text-[var(--foreground)]">{c.latest_post_author}</span>
                      <br />
                      {new Date(c.latest_post_date).toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'short' })}
                    </>
                  ) : (
                    "No posts"
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
