import { getSql } from "@/lib/db";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";
import { getEmailTemplate, applyTemplate } from "@/lib/email-templates";

export type NotifySignUpsResult = { sent: number; error?: string };

function getSiteBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

async function notifyNewsOptInSubscribers(params: {
  templateKey: string;
  title: string;
  link: string;
}): Promise<NotifySignUpsResult> {
  const config = await getSmtpConfig();
  if (!config) return { sent: 0, error: "Email (SMTP) is not configured." };
  const tpl = await getEmailTemplate(params.templateKey);
  if (!tpl) return { sent: 0, error: "The email template for this update is missing." };

  const sql = getSql();
  const users = await sql`
    SELECT id, email, name FROM users
    WHERE role = 'user' AND approved = true AND notify_new_blog = true
  `;

  const list = users as Array<{ email: string; name: string }>;
  if (list.length === 0) return { sent: 0 };

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
    pool: true,
    maxConnections: 5,
    maxMessages: list.length + 2,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  const CHUNK = 5;
  let sent = 0;
  let lastError: string | undefined;
  try {
    for (let i = 0; i < list.length; i += CHUNK) {
      const chunk = list.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map(async (row) => {
          try {
            const vars = { name: row.name, title: params.title, link: params.link };
            await transport.sendMail({
              from: config.from_address || config.contact_inbox,
              to: row.email,
              subject: applyTemplate(tpl.subject, vars),
              text: applyTemplate(tpl.body_text, vars),
              html: applyTemplate(tpl.body_html, vars),
            });
            return { ok: true as const };
          } catch (e) {
            console.error("notify subscribers email", params.templateKey, e);
            return {
              ok: false as const,
              error: e instanceof Error ? e.message : "Send failed",
            };
          }
        })
      );
      for (const r of results) {
        if (r.ok) sent += 1;
        else lastError = r.error;
      }
    }
  } finally {
    transport.close();
  }

  if (sent === 0) {
    return {
      sent: 0,
      error: lastError || "Could not send emails. Check Email settings (SMTP).",
    };
  }
  if (lastError && sent < list.length) {
    return {
      sent,
      error: `Sent ${sent} of ${list.length}. Some failed (${lastError}).`,
    };
  }
  return { sent };
}

export async function notifySubscribersNewPost(params: {
  title: string;
  slug: string;
}): Promise<NotifySignUpsResult> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/news/${params.slug}`;
  return notifyNewsOptInSubscribers({
    templateKey: "blog_new_post",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewPlanningApplication(params: {
  title: string;
  slug: string;
}): Promise<NotifySignUpsResult> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/planning-applications/${params.slug}`;
  return notifyNewsOptInSubscribers({
    templateKey: "planning_new_application",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewEvent(params: {
  title: string;
  slug: string;
}): Promise<NotifySignUpsResult> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/events/${params.slug}`;
  return notifyNewsOptInSubscribers({
    templateKey: "event_new",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewAgenda(params: {
  title: string;
  slug: string;
}): Promise<NotifySignUpsResult> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/agendas/${params.slug}`;
  return notifyNewsOptInSubscribers({
    templateKey: "agenda_new",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewMinutes(params: {
  title: string;
  slug: string;
}): Promise<NotifySignUpsResult> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/minutes/${params.slug}`;
  return notifyNewsOptInSubscribers({
    templateKey: "minutes_new",
    title: params.title,
    link,
  });
}