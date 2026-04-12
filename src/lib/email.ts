import nodemailer from "nodemailer";
import { getSql } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { getEncryptionKey } from "@/lib/server-env";
import { applyTemplate, getEmailTemplate } from "@/lib/email-templates";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from_address: string;
  contact_inbox: string;
};

/** Public inbox for mailto / footer — from SMTP settings or NEXT_PUBLIC_CONTACT_EMAIL. */
export async function getPublicContactEmail(): Promise<string | null> {
  const fromEnv = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  if (fromEnv) return fromEnv;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT NULLIF(TRIM(contact_inbox), '') AS email
      FROM smtp_config
      LIMIT 1
    `;
    const e = (rows[0] as { email: string | null } | undefined)?.email;
    return e?.trim() || null;
  } catch {
    return null;
  }
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT host, port, "user", password_encrypted, from_address, contact_inbox
      FROM smtp_config
      LIMIT 1
    `;
    const row = rows[0] as
      | {
          host: string;
          port: number;
          user: string;
          password_encrypted: string;
          from_address: string;
          contact_inbox: string;
        }
      | undefined;
    if (!row?.host || !row.contact_inbox) return null;
    const password =
      getEncryptionKey() && row.password_encrypted
        ? decrypt(row.password_encrypted)
        : "";
    return {
      host: row.host,
      port: row.port,
      user: row.user,
      password,
      from_address: row.from_address,
      contact_inbox: row.contact_inbox,
    };
  } catch {
    return null;
  }
}

async function getTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth:
      config.user && config.password
        ? { user: config.user, pass: config.password }
        : undefined,
  });
}

export async function sendContactEmail(params: {
  to: string;
  name: string;
  email: string;
  subject: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: config.contact_inbox,
      replyTo: params.email,
      subject: `[Contact] ${params.subject}`,
      text: `From: ${params.name} <${params.email}>\n\nSubject: ${params.subject}\n\n${params.body}`,
      html: `<p><strong>From:</strong> ${params.name} &lt;${params.email}&gt;</p><p><strong>Subject:</strong> ${params.subject}</p><p>${params.body.replace(/\n/g, "<br>")}</p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

export async function sendAssignmentNotification(params: {
  toEmail: string;
  toName: string;
  messageSubject: string;
  messageId: string;
  baseUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  const viewUrl = `${params.baseUrl}/admin/messages/${params.messageId}`;
  const tpl = await getEmailTemplate("message_assigned");
  const vars = {
    name: params.toName,
    subject: params.messageSubject,
    link: viewUrl,
  };
  const subject = tpl
    ? applyTemplate(tpl.subject, vars)
    : `[CGRA] You were assigned a contact message: ${params.messageSubject}`;
  const text = tpl
    ? applyTemplate(tpl.body_text, vars)
    : `Hi ${params.toName},\n\nYou have been assigned a contact form message.\n\nSubject: ${params.messageSubject}\n\nView and reply: ${viewUrl}`;
  const html = tpl
    ? applyTemplate(tpl.body_html, vars)
    : `<p>Hi ${params.toName},</p><p>You have been assigned a contact form message.</p><p><strong>Subject:</strong> ${params.messageSubject}</p><p><a href="${viewUrl}">View and reply</a></p>`;
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: params.toEmail,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

/** When message is assigned to General, notify main inbox */
export async function sendAssignmentToGeneral(params: {
  messageSubject: string;
  messageId: string;
  baseUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  const viewUrl = `${params.baseUrl}/admin/messages/${params.messageId}`;
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: config.contact_inbox,
      subject: `[CGRA] Contact message assigned to General: ${params.messageSubject}`,
      text: `A contact form message has been assigned to General.\n\nSubject: ${params.messageSubject}\n\nView and reply: ${viewUrl}`,
      html: `<p>A contact form message has been assigned to <strong>General</strong>.</p><p><strong>Subject:</strong> ${params.messageSubject}</p><p><a href="${viewUrl}">View and reply</a></p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

/** When admin replies, email the Resident with the reply and link to continue */
export async function sendAdminReplyToResident(params: {
  toEmail: string;
  toName: string;
  messageSubject: string;
  replyBody: string;
  messageId: string;
  baseUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  const threadUrl = `${params.baseUrl}/enquiries/${params.messageId}`;
  const tpl = await getEmailTemplate("message_reply_to_customer");
  const bodyHtml = params.replyBody.replace(/\n/g, "<br>");
  const varsHtml = {
    name: params.toName,
    subject: params.messageSubject,
    body: bodyHtml,
    link: threadUrl,
  };
  const varsText = {
    name: params.toName,
    subject: params.messageSubject,
    body: params.replyBody,
    link: threadUrl,
  };
  const subject = tpl
    ? applyTemplate(tpl.subject, varsText)
    : `[CGRA] Reply to your enquiry: ${params.messageSubject}`;
  const text = tpl
    ? applyTemplate(tpl.body_text, varsText)
    : `Hi ${params.toName},\n\nYou have a reply to your enquiry.\n\nSubject: ${params.messageSubject}\n\n---\n${params.replyBody}\n---\n\nView thread and reply: ${threadUrl}`;
  const html = tpl
    ? applyTemplate(tpl.body_html, varsHtml)
    : `<p>Hi ${params.toName},</p><p>You have a reply to your enquiry.</p><p><strong>Subject:</strong> ${params.messageSubject}</p><div style="margin:1em 0;padding:1em;background:#f5f5f5;border-radius:6px;">${bodyHtml}</div><p><a href="${threadUrl}">View thread and reply</a></p>`;
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: params.toEmail,
      replyTo: config.contact_inbox,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}

/** When Resident replies, notify assigned admin or main inbox if General */
export async function sendResidentReplyNotification(params: {
  toEmail: string;
  toName: string;
  messageSubject: string;
  replyBody: string;
  messageId: string;
  baseUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config) return { ok: false, error: "SMTP not configured" };
  const viewUrl = `${params.baseUrl}/admin/messages/${params.messageId}`;
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: params.toEmail,
      subject: `[CGRA] New reply on enquiry: ${params.messageSubject}`,
      text: `Hi ${params.toName},\n\nA Resident has replied to an enquiry you're assigned to.\n\nSubject: ${params.messageSubject}\n\n---\n${params.replyBody}\n---\n\nView and reply: ${viewUrl}`,
      html: `<p>Hi ${params.toName},</p><p>A Resident has replied to an enquiry.</p><p><strong>Subject:</strong> ${params.messageSubject}</p><div style="margin:1em 0;padding:1em;background:#f5f5f5;border-radius:6px;">${params.replyBody.replace(/\n/g, "<br>")}</div><p><a href="${viewUrl}">View and reply</a></p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}
