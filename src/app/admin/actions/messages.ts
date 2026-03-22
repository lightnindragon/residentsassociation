"use server";

import { getSql } from "@/lib/db";
import { sendAssignmentNotification, sendAssignmentToGeneral } from "@/lib/email";

export async function assignMessage(
  messageId: string,
  assignedToId: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (assignedToId && assignedToId !== "general") {
      const [msg] = await sql`
        SELECT subject FROM contact_messages WHERE id = ${messageId}::uuid LIMIT 1
      `;
      const [user] = await sql`
        SELECT id, email, name FROM users WHERE id = ${assignedToId}::uuid AND role IN ('admin', 'dev') LIMIT 1
      `;
      if (!msg || !user) {
        return { ok: false, error: "Message or user not found." };
      }
      await sql`
        UPDATE contact_messages
        SET assigned_to_id = ${assignedToId}::uuid, updated_at = NOW()
        WHERE id = ${messageId}::uuid
      `;
      await sendAssignmentNotification({
        toEmail: (user as { email: string }).email,
        toName: (user as { name: string }).name,
        messageSubject: (msg as { subject: string }).subject,
        messageId,
        baseUrl,
      });
    } else {
      await sql`
        UPDATE contact_messages
        SET assigned_to_id = NULL, updated_at = NOW()
        WHERE id = ${messageId}::uuid
      `;
      if (assignedToId === "general") {
        const [msg] = await sql`
          SELECT subject FROM contact_messages WHERE id = ${messageId}::uuid LIMIT 1
        `;
        if (msg) {
          await sendAssignmentToGeneral({
            messageSubject: (msg as { subject: string }).subject,
            messageId,
            baseUrl,
          });
        }
      }
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Update failed." };
  }
}

export async function assignMessageAction(formData: FormData): Promise<void> {
  const messageId = formData.get("messageId")?.toString();
  const assignedTo = formData.get("assignedTo")?.toString() ?? null;
  if (messageId) await assignMessage(messageId, assignedTo || null);
}

export type MessageStatus = "unresponded" | "open" | "replied" | "closed";

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    await sql`
      UPDATE contact_messages SET status = ${status}, updated_at = NOW()
      WHERE id = ${messageId}::uuid
    `;
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function addAdminReply(messageId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) return { ok: false, error: "Not authenticated." };
    const sql = getSql();
    const [msg] = await sql`
      SELECT id, name, email, subject FROM contact_messages WHERE id = ${messageId}::uuid LIMIT 1
    `;
    if (!msg) return { ok: false, error: "Message not found." };
    const row = msg as { id: string; name: string; email: string; subject: string };
    await sql`
      INSERT INTO contact_message_replies (contact_message_id, from_side, body, author_id)
      VALUES (${messageId}::uuid, 'admin', ${body}, ${userId}::uuid)
    `;
    await sql`
      UPDATE contact_messages SET status = 'replied', updated_at = NOW()
      WHERE id = ${messageId}::uuid
    `;
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const { sendAdminReplyToResident } = await import("@/lib/email");
    await sendAdminReplyToResident({
      toEmail: row.email,
      toName: row.name,
      messageSubject: row.subject,
      replyBody: body,
      messageId,
      baseUrl,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to send reply." };
  }
}
