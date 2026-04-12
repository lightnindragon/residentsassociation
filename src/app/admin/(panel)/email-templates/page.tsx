import Link from "next/link";
import { getSql } from "@/lib/db";

export default async function EmailTemplatesListPage() {
  type Row = { template_key: string; subject: string; updated_at: string };
  let rows: Row[] = [];
  try {
    const sql = getSql();
    rows = (await sql`
      SELECT template_key, subject, updated_at::text FROM email_templates ORDER BY template_key
    `) as Row[];
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Email Templates</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Use variables like <code className="rounded bg-[var(--color-border)] px-1">{"{{name}}"}</code>,{" "}
        <code className="rounded bg-[var(--color-border)] px-1">{"{{link}}"}</code>,{" "}
        <code className="rounded bg-[var(--color-border)] px-1">{"{{title}}"}</code> where supported.
      </p>
      <ul className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">
            No templates. Run <code>migrate-full-plan.js</code> to seed defaults.
          </li>
        ) : (
          rows.map((r) => (
            <li key={r.template_key}>
              <Link
                href={`/admin/email-templates/${encodeURIComponent(r.template_key)}`}
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                {r.template_key}
              </Link>
              <span className="ml-2 text-sm text-[var(--color-muted)]">{r.subject}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
