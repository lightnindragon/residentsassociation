import nodemailer from "nodemailer";
import { getSql } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from_address: string;
  contact_inbox: string;
};

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
      process.env.ENCRYPTION_KEY && row.password_encrypted
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
  try {
    const transport = await getTransport(config);
    await transport.sendMail({
      from: config.from_address || config.contact_inbox,
      to: params.toEmail,
      subject: `[CGRA] You were assigned a contact message: ${params.messageSubject}`,
      text: `Hi ${params.toName},\n\nYou have been assigned a contact form message.\n\nSubject: ${params.messageSubject}\n\nView and reply: ${viewUrl}`,
      html: `<p>Hi ${params.toName},</p><p>You have been assigned a contact form message.</p><p><strong>Subject:</strong> ${params.messageSubject}</p><p><a href="${viewUrl}">View and reply</a></p>`,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Send failed" };
  }
}
