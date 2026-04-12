import { getSql } from "@/lib/db";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";
import { getEmailTemplate, applyTemplate } from "@/lib/email-templates";

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
}): Promise<void> {
  const config = await getSmtpConfig();
  const tpl = await getEmailTemplate(params.templateKey);
  if (!config || !tpl) return;

  const sql = getSql();
  const users = await sql`
    SELECT id, email, name FROM users
    WHERE role = 'user' AND approved = true AND notify_new_blog = true
  `;

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
  });

  for (const row of users as Array<{ email: string; name: string }>) {
    try {
      const vars = { name: row.name, title: params.title, link: params.link };
      await transport.sendMail({
        from: config.from_address || config.contact_inbox,
        to: row.email,
        subject: applyTemplate(tpl.subject, vars),
        text: applyTemplate(tpl.body_text, vars),
        html: applyTemplate(tpl.body_html, vars),
      });
    } catch (e) {
      console.error("notify subscribers email", params.templateKey, e);
    }
  }
}

export async function notifySubscribersNewPost(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/news/${params.slug}`;
  await notifyNewsOptInSubscribers({
    templateKey: "blog_new_post",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewPlanningApplication(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/planning-applications/${params.slug}`;
  await notifyNewsOptInSubscribers({
    templateKey: "planning_new_application",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewEvent(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/events/${params.slug}`;
  await notifyNewsOptInSubscribers({
    templateKey: "event_new",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewAgenda(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/agendas/${params.slug}`;
  await notifyNewsOptInSubscribers({
    templateKey: "agenda_new",
    title: params.title,
    link,
  });
}

export async function notifySubscribersNewMinutes(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const baseUrl = getSiteBaseUrl();
  const link = `${baseUrl}/minutes/${params.slug}`;
  await notifyNewsOptInSubscribers({
    templateKey: "minutes_new",
    title: params.title,
    link,
  });
}
