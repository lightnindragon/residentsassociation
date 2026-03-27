import Link from "next/link";
import { getSql } from "@/lib/db";
import { formatUkDate } from "@/lib/date-format";

export default async function AdminDashboardPage() {
  let messageCount = 0;
  let newMessageCount = 0;
  let postCount = 0;
  let galleryCount = 0;
  let hasSmtp = false;
  let recentNews: Array<{ id: string; title: string; slug: string; published_at: string | null }> = [];
  let recentForum: Array<{
    id: string;
    title: string;
    category_slug: string;
    area_slug: string;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    const [msg] = await sql`SELECT COUNT(*)::int as c FROM contact_messages`;
    messageCount = (msg as { c: number })?.c ?? 0;
    const [newMsg] = await sql`SELECT COUNT(*)::int as c FROM contact_messages WHERE status = 'unresponded'`;
    newMessageCount = (newMsg as { c: number })?.c ?? 0;
    const [post] = await sql`SELECT COUNT(*)::int as c FROM posts`;
    postCount = (post as { c: number })?.c ?? 0;
    const [gal] = await sql`SELECT COUNT(*)::int as c FROM gallery_images`;
    galleryCount = (gal as { c: number })?.c ?? 0;
    const smtpRows = await sql`SELECT 1 FROM smtp_config WHERE host IS NOT NULL AND host != '' LIMIT 1`;
    hasSmtp = smtpRows.length > 0;
    recentNews = (await sql`
      SELECT id, title, slug, published_at FROM posts
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 5
    `) as typeof recentNews;
    recentForum = (await sql`
      SELECT t.id, t.title, t.created_at, c.slug AS category_slug, a.slug AS area_slug
      FROM forum_threads t
      JOIN forum_categories c ON c.id = t.category_id
      JOIN forum_areas a ON a.id = c.area_id
      ORDER BY t.created_at DESC
      LIMIT 5
    `) as typeof recentForum;
  } catch {
    // DB not configured
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Admin dashboard
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Overview of your site and quick links.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/messages"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {messageCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Contact messages
            {newMessageCount > 0 && (
              <span className="ml-1 font-medium text-[var(--color-primary)]">
                ({newMessageCount} new)
              </span>
            )}
          </p>
        </Link>
        <Link
          href="/admin/news"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {postCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">News posts</p>
        </Link>
        <Link
          href="/admin/gallery"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {galleryCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Gallery images</p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {hasSmtp ? "Configured" : "Not set"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Email / SMTP</p>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Recent news
          </h2>
          <ul className="mt-3 space-y-2">
            {recentNews.length === 0 ? (
              <li className="text-sm text-[var(--color-muted)]">No posts yet.</li>
            ) : (
              recentNews.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/admin/news/${n.id}/edit`}
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    {n.title}
                  </Link>
                  <span className="ml-2 text-xs text-[var(--color-muted)]">
                    {n.published_at
                      ? formatUkDate(n.published_at)
                      : "Draft"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">
            Latest forum activity
          </h2>
          <ul className="mt-3 space-y-2">
            {recentForum.length === 0 ? (
              <li className="text-sm text-[var(--color-muted)]">No threads yet.</li>
            ) : (
              recentForum.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/forum/${t.area_slug}/${t.category_slug}/${t.id}`}
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    {t.title}
                  </Link>
                  <span className="ml-2 text-xs text-[var(--color-muted)]">
                    {formatUkDate(t.created_at)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
