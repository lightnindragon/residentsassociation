"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { notifySubscribersNewPost } from "@/lib/notify-blog";

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
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeHtml(rawBody, { allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]) });
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";
  const catRaw = formData.get("post_category_id")?.toString()?.trim();
  const catId = catRaw && catRaw.length > 0 ? catRaw : null;
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;

  if (!title || !authorId) return { error: "Title and author are required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Body is required." };

  try {
    const sql = getSql();
    let slug = slugify(title);
    const existing = await sql`SELECT id FROM posts WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await sql`
      INSERT INTO posts (title, slug, excerpt, body, author_id, published_at, post_category_id, cover_image_url)
      VALUES (
        ${title}, ${slug}, ${excerpt}, ${body}, ${authorId}::uuid,
        ${publish ? new Date().toISOString() : null},
        ${catId}, ${coverImageUrl}
      )
    `;
    if (publish) {
      void notifySubscribersNewPost({ title, slug });
    }
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
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeHtml(rawBody, { allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]) });
  const publish = formData.get("published") === "1";
  const catRaw2 = formData.get("post_category_id")?.toString()?.trim();
  const catId = catRaw2 && catRaw2.length > 0 ? catRaw2 : null;

  if (!title) return { error: "Title is required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Body is required." };

  try {
    const sql = getSql();
    const [before] = await sql`SELECT slug, published_at FROM posts WHERE id = ${id}::uuid LIMIT 1`;
    const prev = before as { slug: string; published_at: string | null } | undefined;
    const wasPublished = !!prev?.published_at;

    const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
    await sql`
      UPDATE posts
      SET title = ${title}, excerpt = ${excerpt}, body = ${body},
          published_at = ${publish ? new Date().toISOString() : null},
          post_category_id = ${catId}, cover_image_url = ${coverImageUrl},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    if (publish && !wasPublished && prev) {
      void notifySubscribersNewPost({ title, slug: prev.slug });
    }
    revalidatePath("/news");
    revalidatePath(`/news/${prev?.slug ?? ""}`);
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
