"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const [cat] = await sql`
      SELECT slug FROM forum_categories WHERE id = ${categoryId}::uuid LIMIT 1
    `;
    const slug = (cat as { slug: string })?.slug;
    await sql`
      INSERT INTO forum_threads (category_id, title, author_id)
      VALUES (${categoryId}::uuid, ${title}, ${user.id}::uuid)
    `;
    revalidatePath(slug ? `/forum/${slug}` : "/forum");
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
    const [cat] = await sql`
      SELECT slug FROM forum_categories WHERE id = ${t?.category_id}::uuid LIMIT 1
    `;
    const slug = (cat as { slug: string })?.slug;
    revalidatePath(`/forum/${slug}/${threadId}`);
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to post reply." };
  }
}
