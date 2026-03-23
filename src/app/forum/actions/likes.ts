"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function togglePostLike(postId: string, pathToRevalidate: string): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return { ok: false, error: "Please sign in to like posts." };

  try {
    const sql = getSql();
    
    // Check if like exists
    const [existing] = await sql`
      SELECT 1 FROM forum_post_likes 
      WHERE post_id = ${postId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `;

    if (existing) {
      await sql`
        DELETE FROM forum_post_likes 
        WHERE post_id = ${postId}::uuid AND user_id = ${userId}::uuid
      `;
    } else {
      await sql`
        INSERT INTO forum_post_likes (post_id, user_id) 
        VALUES (${postId}::uuid, ${userId}::uuid)
      `;
    }

    revalidatePath(pathToRevalidate);
    return { ok: true };
  } catch (e) {
    console.error("Failed to toggle like:", e);
    return { ok: false, error: "An error occurred." };
  }
}
