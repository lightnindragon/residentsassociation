import Link from "next/link";
import { getSql } from "@/lib/db";

export async function ForumSidebar() {
  type AreaRow = { id: string; name: string; slug: string };
  let areas: AreaRow[] = [];
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT id, name, slug FROM forum_areas ORDER BY sort_order ASC, name ASC
    `) as AreaRow[];
  } catch {
    // no DB
  }

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href="/forum"
        className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--color-border)]"
      >
        Forum Home
      </Link>
      <div className="mt-4 mb-1 px-3 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
        Areas
      </div>
      {areas.map((a) => (
        <Link
          key={a.id}
          href={`/forum/${a.slug}`}
          className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--foreground)]"
        >
          {a.name}
        </Link>
      ))}
    </nav>
  );
}