"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ContactContent = {
  title: string;
  description: string;
  labelName: string;
  labelEmail: string;
  labelSubject: string;
  labelMessage: string;
  labelSubmit: string;
};

export async function saveContactContent(data: ContactContent): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const entries: [string, string][] = [
      ["contact_title", data.title],
      ["contact_description", data.description],
      ["contact_label_name", data.labelName],
      ["contact_label_email", data.labelEmail],
      ["contact_label_subject", data.labelSubject],
      ["contact_label_message", data.labelMessage],
      ["contact_label_submit", data.labelSubmit],
    ];
    for (const [key, value] of entries) {
      await sql`
        INSERT INTO site_content (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    revalidatePath("/contact");
    revalidatePath("/admin/contact");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save." };
  }
}
