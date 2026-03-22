"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFollow(
  targetType: "area" | "category" | "thread",
  targetId: string
): Promise<{ ok: boolean; following: boolean; error?: string }> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return { ok: false, following: false, error: "Sign in required." };
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT id FROM forum_follows
      WHERE user_id = ${userId}::uuid AND target_type = ${targetType} AND target_id = ${targetId}::uuid
      LIMIT 1
    `;
    if (row) {
      await sql`
        DELETE FROM forum_follows
        WHERE user_id = ${userId}::uuid AND target_type = ${targetType} AND target_id = ${targetId}::uuid
      `;
      revalidatePath("/forum");
      return { ok: true, following: false };
    }
    await sql`
      INSERT INTO forum_follows (user_id, target_type, target_id)
      VALUES (${userId}::uuid, ${targetType}, ${targetId}::uuid)
    `;
    revalidatePath("/forum");
    return { ok: true, following: true };
  } catch (e) {
    console.error(e);
    return { ok: false, following: false, error: "Failed." };
  }
}

export async function isFollowing(
  targetType: "area" | "category" | "thread",
  targetId: string
): Promise<boolean> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return false;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 1 FROM forum_follows
      WHERE user_id = ${userId}::uuid AND target_type = ${targetType} AND target_id = ${targetId}::uuid
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
