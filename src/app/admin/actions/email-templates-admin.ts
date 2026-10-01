"use server";

import { saveEmailTemplate } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin-access";

async function requireAdmin() {
  await requireAdminPermission("email-templates");
}

export async function saveEmailTemplateForm(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  try {
    await requireAdmin();
    const key = formData.get("template_key")?.toString()?.trim();
    const subject = formData.get("subject")?.toString() ?? "";
    const body_html = formData.get("body_html")?.toString() ?? "";
    const body_text = formData.get("body_text")?.toString() ?? "";
    if (!key) return { error: "Missing template key." };
    await saveEmailTemplate(key, subject, body_html, body_text);
    revalidatePath("/admin/email-templates");
    revalidatePath(`/admin/email-templates/${key}`);
    return null;
  } catch {
    return { error: "Save failed." };
  }
}
