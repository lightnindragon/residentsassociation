"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { notifySubscribersNewEvent } from "@/lib/notify-blog";

type EventActionResult = { ok?: boolean; error?: string } | null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeEventUrl(input: string): string | null {
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

function revalidateEventPaths(slug: string | null) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  if (slug) revalidatePath(`/events/${slug}`);
}

export async function createEvent(
  _prev: unknown,
  formData: FormData
): Promise<EventActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizeEventUrl(formData.get("external_url")?.toString() ?? "");

  if (!title || !authorId) return { error: "Title and author are required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid event link URL (e.g. https://…)." };

  try {
    const sql = getSql();
    let slug = slugify(title);
    const existing = await sql`SELECT id FROM site_events WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await sql`
      INSERT INTO site_events (
        title, slug, excerpt, body, external_url, author_id, published_at, cover_image_url
      )
      VALUES (
        ${title}, ${slug}, ${excerpt}, ${body}, ${externalUrl}, ${authorId}::uuid,
        ${publish ? new Date().toISOString() : null}, ${coverImageUrl}
      )
    `;
    if (publish) {
      void notifySubscribersNewEvent({ title, slug });
    }
    revalidateEventPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create event." };
  }
}

export async function updateEvent(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<EventActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizeEventUrl(formData.get("external_url")?.toString() ?? "");

  if (!title) return { error: "Title is required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid event link URL (e.g. https://…)." };

  try {
    const sql = getSql();
    const [before] = await sql`
      SELECT slug, published_at FROM site_events WHERE id = ${id}::uuid LIMIT 1
    `;
    const prev = before as { slug: string; published_at: string | null } | undefined;
    const wasPublished = !!prev?.published_at;

    await sql`
      UPDATE site_events
      SET title = ${title}, excerpt = ${excerpt}, body = ${body},
          external_url = ${externalUrl},
          published_at = ${publish ? new Date().toISOString() : null},
          cover_image_url = ${coverImageUrl},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    if (publish && !wasPublished && prev) {
      void notifySubscribersNewEvent({ title, slug: prev.slug });
    }
    revalidateEventPaths(prev?.slug ?? null);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update event." };
  }
}

export async function deleteEvent(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_events WHERE id = ${id}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`DELETE FROM site_events WHERE id = ${id}::uuid`;
    revalidateEventPaths(slug);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function archiveEvent(eventId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_events WHERE id = ${eventId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE site_events SET archived_at = NOW(), updated_at = NOW() WHERE id = ${eventId}::uuid
    `;
    revalidateEventPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to archive." };
  }
}

export async function unarchiveEvent(eventId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_events WHERE id = ${eventId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE site_events SET archived_at = NULL, updated_at = NOW() WHERE id = ${eventId}::uuid
    `;
    revalidateEventPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to unarchive." };
  }
}
