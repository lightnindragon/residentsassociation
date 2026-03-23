"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";

import { revalidatePath } from "next/cache";

import { put } from "@vercel/blob";

export async function saveForumProfile(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return { ok: false, error: "Please sign in." };

  const username = formData.get("username")?.toString()?.trim() ?? "";
  const town = formData.get("town")?.toString()?.trim() ?? "";
  const avatarFile = formData.get("avatar") as File | null;

  if (!username) return { ok: false, error: "Username is required." };
  if (!town) return { ok: false, error: "Town is required." };

  try {
    let avatarUrlStr: string | null = null;
    let updateAvatar = false;

    if (avatarFile && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith("image/")) {
        return { ok: false, error: "Avatar must be an image file." };
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

    const sql = getSql();
    if (updateAvatar) {
      await sql`
        UPDATE users
        SET forum_username = ${username}, forum_town = ${town}, avatar_url = ${avatarUrlStr}, updated_at = NOW()
        WHERE id = ${userId}::uuid
      `;
    } else {
      await sql`
        UPDATE users
        SET forum_username = ${username}, forum_town = ${town}, updated_at = NOW()
        WHERE id = ${userId}::uuid
      `;
    }
    
    revalidatePath("/forum");
    revalidatePath("/forum/setup");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save. Please try again." };
  }
}
