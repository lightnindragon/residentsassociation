"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { notifySubscribersNewPlanningApplication } from "@/lib/notify-blog";

type PlanningActionResult = { ok?: boolean; error?: string } | null;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePlanningUrl(input: string): string | null {
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

function revalidatePlanningPaths(slug: string | null) {
  revalidatePath("/");
  revalidatePath("/planning-applications");
  revalidatePath("/admin/planning-applications");
  if (slug) revalidatePath(`/planning-applications/${slug}`);
}

export async function createPlanningApplication(
  _prev: unknown,
  formData: FormData
): Promise<PlanningActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizePlanningUrl(formData.get("external_url")?.toString() ?? "");

  if (!title || !authorId) return { error: "Title and author are required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid planning portal URL (e.g. https://…)." };

  try {
    const sql = getSql();
    let slug = slugify(title);
    const existing = await sql`SELECT id FROM planning_applications WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    await sql`
      INSERT INTO planning_applications (
        title, slug, excerpt, body, external_url, author_id, published_at, cover_image_url
      )
      VALUES (
        ${title}, ${slug}, ${excerpt}, ${body}, ${externalUrl}, ${authorId}::uuid,
        ${publish ? new Date().toISOString() : null}, ${coverImageUrl}
      )
    `;
    if (publish) {
      void notifySubscribersNewPlanningApplication({ title, slug });
    }
    revalidatePlanningPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create planning application." };
  }
}

export async function updatePlanningApplication(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<PlanningActionResult> {
  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() ?? null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const externalUrl = normalizePlanningUrl(formData.get("external_url")?.toString() ?? "");

  if (!title) return { error: "Title is required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Description is required." };
  if (!externalUrl) return { error: "Enter a valid planning portal URL (e.g. https://…)." };

  try {
    const sql = getSql();
    const [before] = await sql`
      SELECT slug, published_at FROM planning_applications WHERE id = ${id}::uuid LIMIT 1
    `;
    const prev = before as { slug: string; published_at: string | null } | undefined;
    const wasPublished = !!prev?.published_at;

    await sql`
      UPDATE planning_applications
      SET title = ${title}, excerpt = ${excerpt}, body = ${body},
          external_url = ${externalUrl},
          published_at = ${publish ? new Date().toISOString() : null},
          cover_image_url = ${coverImageUrl},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    if (publish && !wasPublished && prev) {
      void notifySubscribersNewPlanningApplication({ title, slug: prev.slug });
    }
    revalidatePlanningPaths(prev?.slug ?? null);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update planning application." };
  }
}

export async function deletePlanningApplication(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM planning_applications WHERE id = ${id}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`DELETE FROM planning_applications WHERE id = ${id}::uuid`;
    revalidatePlanningPaths(slug);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function archivePlanningApplication(
  applicationId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] =
      await sql`SELECT slug FROM planning_applications WHERE id = ${applicationId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE planning_applications SET archived_at = NOW(), updated_at = NOW() WHERE id = ${applicationId}::uuid
    `;
    revalidatePlanningPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to archive." };
  }
}

export async function unarchivePlanningApplication(
  applicationId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] =
      await sql`SELECT slug FROM planning_applications WHERE id = ${applicationId}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`
      UPDATE planning_applications SET archived_at = NULL, updated_at = NOW() WHERE id = ${applicationId}::uuid
    `;
    revalidatePlanningPaths(slug);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to unarchive." };
  }
}
