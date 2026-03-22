import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { EmailTemplateEditForm } from "./EmailTemplateEditForm";

export default async function EmailTemplateEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key: rawKey } = await params;
  const key = decodeURIComponent(rawKey);
  type Row = { template_key: string; subject: string; body_html: string; body_text: string };
  let row: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT template_key, subject, body_html, body_text FROM email_templates WHERE template_key = ${key} LIMIT 1
    `;
    row = (rows[0] as Row) ?? null;
  } catch {
    // no DB
  }
  if (!row) notFound();

  return (
    <div>
      <Link href="/admin/email-templates" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Templates
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">{row.template_key}</h1>
      <EmailTemplateEditForm template={row} />
    </div>
  );
}
