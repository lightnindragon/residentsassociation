"use server";

import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAccountSettings(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return { error: "Not signed in." };

  const forum_username = formData.get("forum_username")?.toString()?.trim() || null;
  const forum_town = formData.get("forum_town")?.toString()?.trim() || null;
  const notify_new_blog = formData.get("notify_new_blog") === "1";
  const forum_emails_enabled = formData.get("forum_emails_enabled") === "1";

  try {
    const sql = getSql();
    await sql`
      UPDATE users SET
        forum_username = ${forum_username},
        forum_town = ${forum_town},
        notify_new_blog = ${notify_new_blog},
        forum_emails_enabled = ${forum_emails_enabled},
        updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;
    revalidatePath("/account");
    revalidatePath("/forum");
    return { ok: true };
  } catch {
    return { error: "Could not save." };
  }
}
