import Link from "next/link";
import { getSql } from "@/lib/db";

export default async function ForumPage() {
  type AreaRow = { id: string; name: string; slug: string; description: string | null };
  type CatRow = { 
    id: string; 
    area_id: string;
    name: string; 
    slug: string; 
    description: string | null; 
    thread_count: number;
    post_count: number;
    last_post_at: string | null;
    last_post_author: string | null;
  };
  
  let areas: AreaRow[] = [];
  let categories: CatRow[] = [];
  
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT id, name, slug, description
      FROM forum_areas
      ORDER BY sort_order ASC, name ASC
    `) as AreaRow[];
    
    categories = (await sql`
      SELECT c.id, c.area_id, c.name, c.slug, c.description,
        (SELECT COUNT(*)::int FROM forum_threads WHERE category_id = c.id) AS thread_count,
        (SELECT COUNT(*)::int FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id WHERE t.category_id = c.id) AS post_count,
        (SELECT p2.created_at FROM forum_posts p2 JOIN forum_threads t2 ON t2.id = p2.thread_id WHERE t2.category_id = c.id ORDER BY p2.created_at DESC LIMIT 1) AS last_post_at,
        (SELECT CASE WHEN lu.role IN ('admin', 'dev') THEN 'Admin' ELSE COALESCE(lu.forum_username, lu.name) END 
         FROM forum_posts lp 
         JOIN forum_threads lt ON lt.id = lp.thread_id 
         LEFT JOIN users lu ON lu.id = lp.author_id 
         WHERE lt.category_id = c.id 
         ORDER BY lp.created_at DESC LIMIT 1) AS last_post_author
      FROM forum_categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `) as CatRow[];
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          Forum
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Browse by area, then pick a category to join the conversation.
        </p>
      </div>

      <div className="space-y-8">
        {areas.length === 0 ? (
          <p className="text-[var(--color-muted)]">No forum areas yet.</p>
        ) : (
          areas.map((area) => {
            const areaCats = categories.filter(c => c.area_id === area.id);
            return (
              <div key={area.id} className="overflow-hidden rounded-md border border-[#006699] bg-[var(--color-card)] shadow-sm">
                <div className="flex justify-between bg-[#006699] px-4 py-2 text-xs font-bold uppercase text-white">
                  <div className="flex-1">
                    <Link href={`/forum/${area.slug}`} className="hover:underline">
                      {area.name}
                    </Link>
                  </div>
                  <div className="hidden w-20 text-center sm:block">TOPICS</div>
                  <div className="hidden w-20 text-center sm:block">POSTS</div>
                  <div className="hidden w-48 pl-4 sm:block">LAST POST</div>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {areaCats.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-[var(--color-muted)]">No categories in this area.</div>
                  ) : (
                    areaCats.map(cat => (
                      <div key={cat.id} className="flex items-center bg-[#fffdf0] px-4 py-3 transition-colors hover:bg-[#fff9e6] dark:bg-[var(--color-card)] dark:hover:bg-[var(--color-muted)]/10">
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
                          <Link href={`/forum/${area.slug}/${cat.slug}`} className="text-base font-bold text-[#006699] hover:underline dark:text-[#4da6ff]">
                            {cat.name}
                          </Link>
                          {cat.description && (
                            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{cat.description}</p>
                          )}
                        </div>
                        <div className="hidden w-20 text-center text-sm font-medium text-[var(--foreground)] sm:block">
                          {cat.thread_count}
                        </div>
                        <div className="hidden w-20 text-center text-sm font-medium text-[var(--foreground)] sm:block">
                          {cat.post_count}
                        </div>
                        <div className="hidden w-48 pl-4 text-xs text-[var(--color-muted)] sm:block">
                          {cat.last_post_author && cat.last_post_at ? (
                            <>
                              by <span className="font-semibold text-[var(--foreground)]">{cat.last_post_author}</span>
                              <br />
                              {new Date(cat.last_post_at).toLocaleString()}
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
            );
          })
        )}
      </div>
    </div>
  );
}
