"use server";

import { auth } from "@/lib/auth";
import { saveEmailTemplate } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const r = (session?.user as { role?: string })?.role;
  if (r !== "admin" && r !== "dev") throw new Error("Forbidden");
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
