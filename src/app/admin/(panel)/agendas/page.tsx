import Link from "next/link";
import { getSql } from "@/lib/db";
import { DeleteAgendaButton } from "./DeleteAgendaButton";
import { ArchiveAgendaButton } from "./ArchiveAgendaButton";
import { formatUkDate } from "@/lib/date-format";

type Filter = "active" | "archived" | "all";

export default async function AdminAgendasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: filterRaw } = await searchParams;
  const filter: Filter =
    filterRaw === "archived" ? "archived" : filterRaw === "all" ? "all" : "active";

  let rows: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
    created_at: string;
    archived_at: string | null;
  }> = [];
  try {
    const sql = getSql();
    if (filter === "active") {
      rows = (await sql`
        SELECT id, title, slug, published_at, created_at, archived_at
        FROM site_agendas
        WHERE archived_at IS NULL
        ORDER BY created_at DESC
        LIMIT 200
      `) as typeof rows;
    } else if (filter === "archived") {
      rows = (await sql`
        SELECT id, title, slug, published_at, created_at, archived_at
        FROM site_agendas
        WHERE archived_at IS NOT NULL
        ORDER BY archived_at DESC
        LIMIT 200
      `) as typeof rows;
    } else {
      rows = (await sql`
        SELECT id, title, slug, published_at, created_at, archived_at
        FROM site_agendas
        ORDER BY created_at DESC
        LIMIT 200
      `) as typeof rows;
    }
  } catch {
    // no DB or table missing
  }

  const tab = (name: string, value: Filter) => {
    const active = filter === value;
    return (
      <Link
        href={value === "active" ? "/admin/agendas" : `/admin/agendas?filter=${value}`}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          active
            ? "bg-[var(--color-primary)] text-white"
            : "border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--color-border)]/30"
        }`}
      >
        {name}
      </Link>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Agendas</h1>
        <Link
          href="/admin/agendas/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          New Agenda
        </Link>
      </div>
      <p className="mt-1 text-[var(--color-muted)]">
        Meeting agendas with a link to the full document or external page. Archived items stay here
        but are hidden from the public site.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab("Active", "active")}
        {tab("Archived", "archived")}
        {tab("All", "all")}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">Title</th>
              <th className="py-3 text-left font-medium">Status</th>
              <th className="py-3 text-left font-medium">Date</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[var(--color-muted)]">
                  {filter === "archived" ? "No archived agendas." : "No agendas yet."}
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const archived = !!p.archived_at;
                let status = p.published_at ? "Published" : "Draft";
                if (archived) status = `Archived${p.published_at ? "" : " (draft)"}`;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[var(--color-border)] ${archived ? "opacity-80" : ""}`}
                  >
                    <td className="py-3">
                      <Link
                        href={`/admin/agendas/${p.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-3">{status}</td>
                    <td className="py-3 text-[var(--color-muted)]">
                      {archived && p.archived_at
                        ? `Archived ${formatUkDate(p.archived_at)}`
                        : formatUkDate(p.created_at)}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/agendas/${p.id}/edit`}
                        className="mr-2 text-[var(--color-primary)] hover:underline"
                      >
                        Edit
                      </Link>
                      <span className="mr-2 inline-block">
                        <ArchiveAgendaButton agendaId={p.id} archived={archived} />
                      </span>
                      <DeleteAgendaButton agendaId={p.id} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
