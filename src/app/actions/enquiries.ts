"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendResidentReplyNotification } from "@/lib/email";

/** Shared logic: add resident reply and notify assignee (or General inbox). Used by web form and inbound email API. */
export async function addResidentReplyByEmail(
  messageId: string,
  fromEmail: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [msg] = await sql`
      SELECT id, name, email, subject, assigned_to_id FROM contact_messages
      WHERE id = ${messageId}::uuid LIMIT 1
    `;
    if (!msg) return { ok: false, error: "Message not found." };
    const row = msg as { id: string; name: string; email: string; subject: string; assigned_to_id: string | null };

    if (row.email.toLowerCase() !== fromEmail.trim().toLowerCase()) {
      return { ok: false, error: "Email does not match this enquiry." };
    }

    await sql`
      INSERT INTO contact_message_replies (contact_message_id, from_side, body)
      VALUES (${messageId}::uuid, 'resident', ${body})
    `;
    await sql`
      UPDATE contact_messages SET status = 'open', updated_at = NOW()
      WHERE id = ${messageId}::uuid
    `;

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (row.assigned_to_id) {
      const [admin] = await sql`
        SELECT email, name FROM users WHERE id = ${row.assigned_to_id}::uuid AND role IN ('admin', 'dev') LIMIT 1
      `;
      if (admin) {
        await sendResidentReplyNotification({
          toEmail: (admin as { email: string }).email,
          toName: (admin as { name: string }).name,
          messageSubject: row.subject,
          replyBody: body,
          messageId,
          baseUrl,
        });
      }
    } else {
      const { getSmtpConfig } = await import("@/lib/email");
      const config = await getSmtpConfig();
      if (config) {
        await sendResidentReplyNotification({
          toEmail: config.contact_inbox,
          toName: "General",
          messageSubject: row.subject,
          replyBody: body,
          messageId,
          baseUrl,
        });
      }
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to send reply." };
  }
}

export async function addResidentReply(
  messageId: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  const userEmail = (session?.user as { email?: string })?.email;
  if (!userEmail) return { ok: false, error: "Please sign in to reply." };
  return addResidentReplyByEmail(messageId, userEmail, body);
}
