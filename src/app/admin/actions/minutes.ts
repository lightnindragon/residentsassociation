"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { notifySubscribersNewMinutes } from "@/lib/notify-blog";

type MinutesActionResult = { ok?: boolean; error?: string } | null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMinutesUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  let urlStr = raw;
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function revalidateMinutesPaths(slug: string | null) {
  revalidatePath("/");
  revalidatePath("/minutes");
  revalidatePath("/admin/minutes");
  if (slug) revalidatePath(`/minutes/${slug}`);
}

export async function createMinutesEntry(
  _prev: unknown,
  formData: FormData
): Promise<MinutesActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizeMinutesUrl(formData.get("external_url")?.toString() ?? "");

  if (!title || !authorId) return { error: "Title and author are required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid minutes document URL (e.g. https://…)." };

  try {
    const sql = getSql();
    let slug = slugify(title);
    const existing = await sql`SELECT id FROM site_minutes WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await sql`
      INSERT INTO site_minutes (
        title, slug, excerpt, body, external_url, author_id, published_at, cover_image_url
      )
      VALUES (
        ${title}, ${slug}, ${excerpt}, ${body}, ${externalUrl}, ${authorId}::uuid,
        ${publish ? new Date().toISOString() : null}, ${coverImageUrl}
      )
    `;
    if (publish) {
      void notifySubscribersNewMinutes({ title, slug });
    }
    revalidateMinutesPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create minutes entry." };
  }
}

export async function updateMinutesEntry(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<MinutesActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizeMinutesUrl(formData.get("external_url")?.toString() ?? "");

  if (!title) return { error: "Title is required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid minutes document URL (e.g. https://…)." };

  try {
    const sql = getSql();
    const [before] = await sql`
      SELECT slug, published_at FROM site_minutes WHERE id = ${id}::uuid LIMIT 1
    `;
    const prev = before as { slug: string; published_at: string | null } | undefined;
    const wasPublished = !!prev?.published_at;

    await sql`
      UPDATE site_minutes
      SET title = ${title}, excerpt = ${excerpt}, body = ${body},
          external_url = ${externalUrl},
          published_at = ${publish ? new Date().toISOString() : null},
          cover_image_url = ${coverImageUrl},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    if (publish && !wasPublished && prev) {
      void notifySubscribersNewMinutes({ title, slug: prev.slug });
    }
    revalidateMinutesPaths(prev?.slug ?? null);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update minutes entry." };
  }
}

export async function deleteMinutesEntry(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_minutes WHERE id = ${id}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`DELETE FROM site_minutes WHERE id = ${id}::uuid`;
    revalidateMinutesPaths(slug);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function archiveMinutesEntry(
  entryId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_minutes WHERE id = ${entryId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE site_minutes SET archived_at = NOW(), updated_at = NOW() WHERE id = ${entryId}::uuid
    `;
    revalidateMinutesPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to archive." };
  }
}

export async function unarchiveMinutesEntry(
  entryId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_minutes WHERE id = ${entryId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE site_minutes SET archived_at = NULL, updated_at = NOW() WHERE id = ${entryId}::uuid
    `;
    revalidateMinutesPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to unarchive." };
  }
}
