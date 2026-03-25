"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getCategoryForumPath, forumCategoryUrl, forumThreadUrl } from "@/lib/forum-paths";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin" && user?.role !== "dev") throw new Error("Admin only");
}

export async function addCategory(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Forbidden." };
  }
  const name = formData.get("name")?.toString()?.trim();
  const slugInput = formData.get("slug")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() ?? null;
  const sort_order = parseInt(formData.get("sort_order")?.toString() ?? "0", 10);
  const areaId = formData.get("area_id")?.toString()?.trim();

  if (!name) return { error: "Name is required." };
  if (!areaId) return { error: "Area is required." };
  const slug = slugInput ? slugify(slugInput) : slugify(name);

  try {
    const sql = getSql();
    await sql`
      INSERT INTO forum_categories (name, slug, description, sort_order, area_id)
      VALUES (${name}, ${slug}, ${description}, ${sort_order}, ${areaId}::uuid)
    `;
    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to add category (slug may be in use)." };
  }
}

export async function addArea(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Forbidden." };
  }
  const name = formData.get("name")?.toString()?.trim();
  const slugInput = formData.get("slug")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() ?? null;
  const sort_order = parseInt(formData.get("sort_order")?.toString() ?? "0", 10);
  if (!name) return { error: "Name is required." };
  const slug = slugInput ? slugify(slugInput) : slugify(name);
  try {
    const sql = getSql();
    await sql`
      INSERT INTO forum_areas (name, slug, description, sort_order)
      VALUES (${name}, ${slug}, ${description}, ${sort_order})
    `;
    revalidatePath("/forum");
    revalidatePath("/admin/forum");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to add area (slug may be in use)." };
  }
}

export async function toggleThreadPinned(threadId: string, pinned: boolean): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    const [row] = await sql`
      SELECT category_id FROM forum_threads WHERE id = ${threadId}::uuid LIMIT 1
    `;
    const cat = row as { category_id: string } | undefined;
    if (!cat) return { error: "Thread not found." };
    await sql`
      UPDATE forum_threads SET pinned = ${pinned}, updated_at = NOW() WHERE id = ${threadId}::uuid
    `;
    const paths = await getCategoryForumPath(cat.category_id);
    if (paths) {
      revalidatePath(forumCategoryUrl(paths.areaSlug, paths.categorySlug));
      revalidatePath(forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId));
    }
    revalidatePath("/forum");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function toggleThreadLocked(threadId: string, locked: boolean): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    const [row] = await sql`
      SELECT category_id FROM forum_threads WHERE id = ${threadId}::uuid LIMIT 1
    `;
    const cat = row as { category_id: string } | undefined;
    if (!cat) return { error: "Thread not found." };
    await sql`
      UPDATE forum_threads SET locked = ${locked}, updated_at = NOW() WHERE id = ${threadId}::uuid
    `;
    const paths = await getCategoryForumPath(cat.category_id);
    if (paths) {
      revalidatePath(forumCategoryUrl(paths.areaSlug, paths.categorySlug));
      revalidatePath(forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId));
    }
    revalidatePath("/forum");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function toggleThreadAdminOnly(threadId: string, adminOnly: boolean): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    const [row] = await sql`
      SELECT category_id FROM forum_threads WHERE id = ${threadId}::uuid LIMIT 1
    `;
    const cat = row as { category_id: string } | undefined;
    if (!cat) return { error: "Thread not found." };
    await sql`
      UPDATE forum_threads SET admin_only = ${adminOnly}, updated_at = NOW() WHERE id = ${threadId}::uuid
    `;
    const paths = await getCategoryForumPath(cat.category_id);
    if (paths) {
      revalidatePath(forumCategoryUrl(paths.areaSlug, paths.categorySlug));
      revalidatePath(forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId));
    }
    revalidatePath("/forum");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function deleteForumPost(postId: string, threadId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    const [thread] = await sql`
      SELECT category_id FROM forum_threads WHERE id = ${threadId}::uuid LIMIT 1
    `;
    const t = thread as { category_id: string } | undefined;
    if (!t) return { error: "Thread not found." };
    await sql`DELETE FROM forum_posts WHERE id = ${postId}::uuid AND thread_id = ${threadId}::uuid`;
    const paths = await getCategoryForumPath(t.category_id);
    if (paths) {
      revalidatePath(forumThreadUrl(paths.areaSlug, paths.categorySlug, threadId));
    }
    revalidatePath("/forum");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed." };
  }
}
