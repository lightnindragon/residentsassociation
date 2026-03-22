import { getSql } from "@/lib/db";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";
import { getEmailTemplate, applyTemplate } from "@/lib/email-templates";
import { forumThreadUrl, getCategoryForumPath } from "@/lib/forum-paths";

function baseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

async function sendToMany(
  recipients: Array<{ email: string; name: string }>,
  subject: string,
  html: string,
  text: string
) {
  const config = await getSmtpConfig();
  if (!config || recipients.length === 0) return;
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
  });
  const from = config.from_address || config.contact_inbox;
  for (const r of recipients) {
    try {
      await transport.sendMail({ from, to: r.email, subject, html, text });
    } catch (e) {
      console.error("forum notify", e);
    }
  }
}

/** Notify users following the area or category (not the thread author). */
export async function notifyForumNewThread(threadId: string, authorId: string): Promise<void> {
  const tpl = await getEmailTemplate("forum_new_thread");
  if (!tpl) return;

  const sql = getSql();
  const [t] = await sql`
    SELECT t.title, t.category_id, c.name AS category_name, a.id AS area_id
    FROM forum_threads t
    JOIN forum_categories c ON c.id = t.category_id
    JOIN forum_areas a ON a.id = c.area_id
    WHERE t.id = ${threadId}::uuid
    LIMIT 1
  `;
  if (!t) return;
  const row = t as { title: string; category_id: string; category_name: string; area_id: string };
  const paths = await getCategoryForumPath(row.category_id);
  const link = paths
    ? `${baseUrl()}${forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId)}`
    : `${baseUrl()}/forum`;

  const users = await sql`
    SELECT DISTINCT u.email, u.name FROM users u
    INNER JOIN forum_follows f ON f.user_id = u.id
    WHERE u.forum_emails_enabled = true
      AND u.id != ${authorId}::uuid
      AND (
        (f.target_type = 'category' AND f.target_id = ${row.category_id}::uuid)
        OR (f.target_type = 'area' AND f.target_id = ${row.area_id}::uuid)
      )
  `;
  const recipients = users as Array<{ email: string; name: string }>;
  const vars = { title: row.title, category: row.category_name, link };
  await sendToMany(
    recipients,
    applyTemplate(tpl.subject, vars),
    applyTemplate(tpl.body_html, vars),
    applyTemplate(tpl.body_text, vars)
  );
}

/** Thread author + users following the thread (excluding reply author). */
export async function notifyForumNewReply(
  threadId: string,
  replyAuthorId: string,
  replyBody: string
): Promise<void> {
  const tpl = await getEmailTemplate("forum_new_reply");
  if (!tpl) return;

  const sql = getSql();
  const [t] = await sql`
    SELECT t.title, t.author_id, t.category_id
    FROM forum_threads t
    WHERE t.id = ${threadId}::uuid
    LIMIT 1
  `;
  if (!t) return;
  const row = t as { title: string; author_id: string; category_id: string };
  const paths = await getCategoryForumPath(row.category_id);
  const link = paths
    ? `${baseUrl()}${forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId)}`
    : `${baseUrl()}/forum`;

  const preview =
    replyBody.length > 200 ? `${replyBody.slice(0, 200)}…` : replyBody;

  const followRows = await sql`
    SELECT DISTINCT u.email, u.name FROM users u
    INNER JOIN forum_follows f ON f.user_id = u.id
    WHERE u.forum_emails_enabled = true
      AND u.id != ${replyAuthorId}::uuid
      AND f.target_type = 'thread'
      AND f.target_id = ${threadId}::uuid
  `;

  const recipients: Array<{ email: string; name: string }> = [...(followRows as typeof recipients)];

  if (row.author_id !== replyAuthorId && row.author_id) {
    const [author] = await sql`
      SELECT email, name, forum_emails_enabled FROM users WHERE id = ${row.author_id}::uuid LIMIT 1
    `;
    const a = author as { email: string; name: string; forum_emails_enabled: boolean } | undefined;
    if (a?.forum_emails_enabled && a.email) {
      recipients.push({ email: a.email, name: a.name });
    }
  }

  const seen = new Set<string>();
  const unique = recipients.filter((r) => {
    const k = r.email.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const vars = { title: row.title, link, preview };
  await sendToMany(
    unique,
    applyTemplate(tpl.subject, vars),
    applyTemplate(tpl.body_html, vars),
    applyTemplate(tpl.body_text, vars)
  );
}
