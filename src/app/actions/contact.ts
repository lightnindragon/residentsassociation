"use server";

import { getSql } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

export type ContactResult = { success?: boolean; error?: string } | null;

export async function submitContact(
  _prev: ContactResult,
  formData: FormData
): Promise<ContactResult> {
  const name = formData.get("name")?.toString()?.trim();
  const email = formData.get("email")?.toString()?.trim();
  const subject = formData.get("subject")?.toString()?.trim();
  const body = formData.get("body")?.toString()?.trim();

  if (!name || !email || !subject || !body) {
    return { success: false, error: "All fields are required." };
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO contact_messages (name, email, subject, body, status)
      VALUES (${name}, ${email}, ${subject}, ${body}, 'unresponded')
    `;

    const sendResult = await sendContactEmail({
      to: email,
      name,
      email,
      subject,
      body,
    });
    if (!sendResult.ok && sendResult.error) {
      console.error("Contact email send failed:", sendResult.error);
      // Still success - message is stored; admin can see it
    }
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
