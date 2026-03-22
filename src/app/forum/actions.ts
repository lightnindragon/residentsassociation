"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getCategoryForumPath, forumCategoryUrl, forumThreadUrl } from "@/lib/forum-paths";

export async function createThread(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return { error: "You must be signed in to create a thread." };

  const categoryId = formData.get("categoryId")?.toString();
  const title = formData.get("title")?.toString()?.trim();
  if (!categoryId || !title) return { error: "Title is required." };

  try {
    const sql = getSql();
    const [urow] = await sql`SELECT banned FROM users WHERE id = ${user.id}::uuid LIMIT 1`;
    if ((urow as { banned?: boolean })?.banned) return { error: "Your account cannot post." };
    const [inserted] = await sql`
      INSERT INTO forum_threads (category_id, title, author_id)
      VALUES (${categoryId}::uuid, ${title}, ${user.id}::uuid)
      RETURNING id
    `;
    const newThreadId = (inserted as { id: string })?.id;
    if (newThreadId) {
      const { notifyForumNewThread } = await import("@/lib/forum-notify");
      void notifyForumNewThread(newThreadId, user.id);
    }
    const paths = await getCategoryForumPath(categoryId);
    if (paths) revalidatePath(forumCategoryUrl(paths.areaSlug, paths.categorySlug));
    revalidatePath("/forum");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to create thread." };
  }
}

export async function createReply(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) return { error: "You must be signed in to reply." };

  const threadId = formData.get("threadId")?.toString();
  const body = formData.get("body")?.toString()?.trim();
  if (!threadId || !body) return { error: "Message is required." };

  try {
    const sql = getSql();
    const [urow] = await sql`SELECT banned FROM users WHERE id = ${user.id}::uuid LIMIT 1`;
    if ((urow as { banned?: boolean })?.banned) return { error: "Your account cannot post." };
    const [thread] = await sql`
      SELECT locked, category_id FROM forum_threads WHERE id = ${threadId}::uuid LIMIT 1
    `;
    const t = thread as { locked: boolean; category_id: string } | undefined;
    if (t?.locked) return { error: "This thread is locked." };

    await sql`
      INSERT INTO forum_posts (thread_id, author_id, body)
      VALUES (${threadId}::uuid, ${user.id}::uuid, ${body})
    `;
    await sql`
      UPDATE forum_threads SET updated_at = NOW() WHERE id = ${threadId}::uuid
    `;
    const { notifyForumNewReply } = await import("@/lib/forum-notify");
    void notifyForumNewReply(threadId, user.id, body);
    const paths = t ? await getCategoryForumPath(t.category_id) : null;
    if (paths) revalidatePath(forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId));
    revalidatePath("/forum");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to post reply." };
  }
}
