import Link from "next/link";
import { getSql } from "@/lib/db";
import { DeletePageButton } from "./DeletePageButton";
import { formatUkDate } from "@/lib/date-format";

export default async function AdminPagesPage() {
  let rows: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
    updated_at: string;
  }> = [];
  try {
    const sql = getSql();
    rows = (await sql`
      SELECT id, title, slug, published_at, updated_at
      FROM site_pages
      ORDER BY updated_at DESC
      LIMIT 200
    `) as typeof rows;
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          New Page
        </Link>
      </div>
      <p className="mt-1 text-[var(--color-muted)]">
        Create your own website pages, then add them to the header menu like News or Agendas.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">Title</th>
              <th className="py-3 text-left font-medium">URL</th>
              <th className="py-3 text-left font-medium">Status</th>
              <th className="py-3 text-left font-medium">Updated</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-muted)]">
                  No custom pages yet.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3">
                    <Link
                      href={`/admin/pages/${p.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 text-[var(--color-muted)]">/{p.slug}</td>
                  <td className="py-3">{p.published_at ? "Published" : "Draft"}</td>
                  <td className="py-3 text-[var(--color-muted)]">{formatUkDate(p.updated_at)}</td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/${p.slug}`}
                      className="mr-2 text-[var(--color-primary)] hover:underline"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/pages/${p.id}/edit`}
                      className="mr-2 text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </Link>
                    <DeletePageButton pageId={p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
