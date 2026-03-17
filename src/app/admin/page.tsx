import Link from "next/link";
import { getSql } from "@/lib/db";

export default async function AdminDashboardPage() {
  let messageCount = 0;
  let postCount = 0;
  let hasSmtp = false;
  try {
    const sql = getSql();
    const [msg] = await sql`SELECT COUNT(*)::int as c FROM contact_messages`;
    messageCount = (msg as { c: number })?.c ?? 0;
    const [post] = await sql`SELECT COUNT(*)::int as c FROM posts`;
    postCount = (post as { c: number })?.c ?? 0;
    const smtpRows = await sql`SELECT 1 FROM smtp_config WHERE host IS NOT NULL AND host != '' LIMIT 1`;
    hasSmtp = smtpRows.length > 0;
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
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/messages"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {messageCount}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Contact messages
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
          href="/admin/settings"
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[var(--foreground)]">
            {hasSmtp ? "Configured" : "Not set"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Email / SMTP</p>
        </Link>
      </div>
    </div>
  );
}
