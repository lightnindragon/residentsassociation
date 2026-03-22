import { getSql } from "@/lib/db";

export type TemplateRow = {
  template_key: string;
  subject: string;
  body_html: string;
  body_text: string;
};

export function applyTemplate(template: string, vars: Record<string, string>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v ?? "");
  }
  return out;
}

export async function getEmailTemplate(key: string): Promise<TemplateRow | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT template_key, subject, body_html, body_text FROM email_templates WHERE template_key = ${key} LIMIT 1
    `;
    return (rows[0] as TemplateRow) ?? null;
  } catch {
    return null;
  }
}

export async function saveEmailTemplate(
  key: string,
  subject: string,
  bodyHtml: string,
  bodyText: string
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO email_templates (template_key, subject, body_html, body_text)
    VALUES (${key}, ${subject}, ${bodyHtml}, ${bodyText})
    ON CONFLICT (template_key) DO UPDATE SET
      subject = EXCLUDED.subject,
      body_html = EXCLUDED.body_html,
      body_text = EXCLUDED.body_text,
      updated_at = NOW()
  `;
}
