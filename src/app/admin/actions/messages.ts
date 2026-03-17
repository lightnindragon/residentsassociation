"use server";

import { getSql } from "@/lib/db";
import { sendAssignmentNotification } from "@/lib/email";

export async function assignMessage(
  messageId: string,
  assignedToId: string | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (assignedToId) {
      const [msg] = await sql`
        SELECT subject FROM contact_messages WHERE id = ${messageId}::uuid LIMIT 1
      `;
      const [user] = await sql`
        SELECT id, email, name FROM users WHERE id = ${assignedToId}::uuid AND role = 'admin' LIMIT 1
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
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Update failed." };
  }
}

export async function assignMessageAction(formData: FormData): Promise<void> {
  const messageId = formData.get("messageId")?.toString();
  const assignedToId = formData.get("assignedTo")?.toString() || null;
  if (messageId) await assignMessage(messageId, assignedToId);
}

export async function updateMessageStatus(
  messageId: string,
  status: "new" | "in_progress" | "done"
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
