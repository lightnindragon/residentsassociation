import { getSql } from "@/lib/db";
import { getSmtpConfig } from "@/lib/email";
import nodemailer from "nodemailer";
import { getEmailTemplate, applyTemplate } from "@/lib/email-templates";

export async function notifySubscribersNewPost(params: {
  title: string;
  slug: string;
}): Promise<void> {
  const config = await getSmtpConfig();
  const tpl = await getEmailTemplate("blog_new_post");
  if (!config || !tpl) return;

  const sql = getSql();
  const users = await sql`
    SELECT id, email, name FROM users
    WHERE role = 'user' AND approved = true AND notify_new_blog = true
  `;
  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const link = `${baseUrl}/news/${params.slug}`;

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user && config.password ? { user: config.user, pass: config.password } : undefined,
  });

  for (const row of users as Array<{ email: string; name: string }>) {
    try {
      const vars = { name: row.name, title: params.title, link };
      await transport.sendMail({
        from: config.from_address || config.contact_inbox,
        to: row.email,
        subject: applyTemplate(tpl.subject, vars),
        text: applyTemplate(tpl.body_text, vars),
        html: applyTemplate(tpl.body_html, vars),
      });
    } catch (e) {
      console.error("notify blog", e);
    }
  }
}
