"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createPost(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const body = formData.get("body")?.toString()?.trim() ?? "";
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";

  if (!title || !authorId) return { error: "Title and author are required." };

  try {
    const sql = getSql();
    let slug = slugify(title);
    const existing = await sql`SELECT id FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await sql`
      INSERT INTO posts (title, slug, excerpt, body, author_id, published_at)
      VALUES (${title}, ${slug}, ${excerpt}, ${body}, ${authorId}::uuid, ${publish ? new Date().toISOString() : null})
    `;
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to create post." };
  }
}

export async function updatePost(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string } | null> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const body = formData.get("body")?.toString()?.trim() ?? "";
  const publish = formData.get("published") === "1";

  if (!title) return { error: "Title is required." };

  try {
    const sql = getSql();
    await sql`
      UPDATE posts
      SET title = ${title}, excerpt = ${excerpt}, body = ${body},
          published_at = ${publish ? new Date().toISOString() : null},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to update post." };
  }
}

export async function deletePost(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    await sql`DELETE FROM posts WHERE id = ${id}::uuid`;
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
