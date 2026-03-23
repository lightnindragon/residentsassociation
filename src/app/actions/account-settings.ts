"use server";

import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

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
  const address = formData.get("address")?.toString()?.trim() || null;
  const avatarFile = formData.get("avatar") as File | null;

  try {
    const sql = getSql();
    let avatarUrlStr: string | null = null;
    let updateAvatar = false;

    if (avatarFile && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith("image/")) {
        return { error: "Avatar must be an image file." };
      }
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        const ext = avatarFile.name.split(".").pop() || "png";
        const blob = await put(`avatars/${userId}-${Date.now()}.${ext}`, avatarFile, {
          access: "public",
          token,
          contentType: avatarFile.type,
        });
        avatarUrlStr = blob.url;
        updateAvatar = true;
      }
    }

    if (updateAvatar) {
      await sql`
        UPDATE users SET
          forum_username = ${forum_username},
          forum_town = ${forum_town},
          notify_new_blog = ${notify_new_blog},
          forum_emails_enabled = ${forum_emails_enabled},
          avatar_url = ${avatarUrlStr},
          address = COALESCE(${address}, address),
          updated_at = NOW()
        WHERE id = ${userId}::uuid
      `;
    } else {
      await sql`
        UPDATE users SET
          forum_username = ${forum_username},
          forum_town = ${forum_town},
          notify_new_blog = ${notify_new_blog},
          forum_emails_enabled = ${forum_emails_enabled},
          address = COALESCE(${address}, address),
          updated_at = NOW()
        WHERE id = ${userId}::uuid
      `;
    }
    
    revalidatePath("/account");
    revalidatePath("/forum");
    return { ok: true };
  } catch (err) {
    console.error("Failed to save account settings:", err);
    return { error: "Could not save." };
  }
}
