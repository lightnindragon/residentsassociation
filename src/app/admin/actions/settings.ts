"use server";

import { getSql } from "@/lib/db";
import { encrypt } from "@/lib/encrypt";

export type SettingsResult = { ok?: boolean; error?: string };

export async function saveSmtpConfig(
  _prev: SettingsResult | null,
  formData: FormData
): Promise<SettingsResult | null> {
  const host = formData.get("host")?.toString()?.trim() ?? "";
  const port = parseInt(formData.get("port")?.toString() ?? "587", 10);
  const user = formData.get("user")?.toString()?.trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const from_address =
    formData.get("from_address")?.toString()?.trim() ?? "";
  const contact_inbox =
    formData.get("contact_inbox")?.toString()?.trim() ?? "";

  if (!host || !contact_inbox) {
    return { error: "Host and contact inbox are required." };
  }

  try {
    const sql = getSql();
    const existingRows = await sql`
      SELECT id, password_encrypted FROM smtp_config LIMIT 1
    `;
    const existing = existingRows[0] as
      | { id: string; password_encrypted: string }
      | undefined;
    const password_encrypted = password
      ? encrypt(password)
      : (existing?.password_encrypted ?? "");

    if (existing?.id) {
      await sql`
        UPDATE smtp_config
        SET host = ${host}, port = ${port}, "user" = ${user},
            password_encrypted = ${password_encrypted},
            from_address = ${from_address}, contact_inbox = ${contact_inbox},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;
    } else {
      if (!password_encrypted) {
        return { error: "Password is required for new SMTP config." };
      }
      await sql`
        INSERT INTO smtp_config (host, port, "user", password_encrypted, from_address, contact_inbox)
        VALUES (${host}, ${port}, ${user}, ${password_encrypted}, ${from_address}, ${contact_inbox})
      `;
    }
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save. Check ENCRYPTION_KEY is set." };
  }
}
