"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function saveForumProfile(
  username: string,
  town: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return { ok: false, error: "Please sign in." };

  const u = username?.trim() ?? "";
  const t = town?.trim() ?? "";
  if (!u) return { ok: false, error: "Username is required." };
  if (!t) return { ok: false, error: "Town is required." };

  try {
    const sql = getSql();
    await sql`
      UPDATE users
      SET forum_username = ${u}, forum_town = ${t}, updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save. Please try again." };
  }
}
