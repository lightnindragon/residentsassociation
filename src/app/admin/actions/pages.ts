"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { sanitizeRichHtml } from "@/lib/rich-text";
import { adminDenied } from "@/lib/admin-access";
import {
  appendNavItemIfMissing,
  removeNavHrefs,
  rewriteNavHrefs,
} from "@/lib/nav-menu";
import { normalizePageSlug, slugifyPageTitle } from "@/lib/site-pages";

export type PageActionResult = { ok?: boolean; error?: string; slug?: string };

function revalidatePagePaths(slug: string | null, previousSlug?: string | null) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/pages");
  revalidatePath("/admin/header-menus");
  if (slug) revalidatePath(`/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/${previousSlug}`);
}

async function uniqueSlug(sql: ReturnType<typeof getSql>, desired: string, exceptId?: string) {
  let slug = desired;
  for (let i = 0; i < 8; i++) {
    const rows = exceptId
      ? await sql`SELECT id FROM site_pages WHERE slug = ${slug} AND id <> ${exceptId}::uuid LIMIT 1`
      : await sql`SELECT id FROM site_pages WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return slug;
    slug = `${desired}-${i + 2}`;
  }
  return `${desired}-${Date.now()}`;
}

export async function createPage(
  _prev: unknown,
  formData: FormData
): Promise<PageActionResult> {
  const denied = await adminDenied("pages");
  if (denied) return { error: denied };

  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() || null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const authorId = formData.get("authorId")?.toString();
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const addDesktop = formData.get("add_desktop") === "1";
  const addMobile = formData.get("add_mobile") === "1";
  const slugInput = formData.get("slug")?.toString()?.trim() || title || "";

  if (!title || !authorId) return { error: "Title and author are required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Page content is required." };

  const baseSlug = normalizePageSlug(slugInput);
  if (!baseSlug) {
    return {
      error: slugifyPageTitle(slugInput)
        ? "That URL is already used by the site. Choose a different page URL."
        : "Enter a page URL using letters and numbers.",
    };
  }

  try {
    const sql = getSql();
    const slug = await uniqueSlug(sql, baseSlug);
    const href = `/${slug}`;

    await sql`
      INSERT INTO site_pages (
        title, slug, excerpt, body, cover_image_url, author_id, published_at
      )
      VALUES (
        ${title}, ${slug}, ${excerpt}, ${body}, ${coverImageUrl}, ${authorId}::uuid,
        ${publish ? new Date().toISOString() : null}
      )
    `;

    const navItem = { id: randomUUID(), label: title, href };
    if (addDesktop) await appendNavItemIfMissing("desktop", navItem);
    if (addMobile) await appendNavItemIfMissing("mobile", { ...navItem, id: randomUUID() });

    revalidatePagePaths(slug);
    return { ok: true, slug };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create page." };
  }
}

export async function updatePage(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<PageActionResult> {
  const denied = await adminDenied("pages");
  if (denied) return { error: denied };

  const title = formData.get("title")?.toString()?.trim();
  const excerpt = formData.get("excerpt")?.toString()?.trim() || null;
  const rawBody = formData.get("body")?.toString() ?? "";
  const body = sanitizeRichHtml(rawBody);
  const publish = formData.get("published") === "1";
  const coverImageUrl = formData.get("cover_image_url")?.toString()?.trim() || null;
  const addDesktop = formData.get("add_desktop") === "1";
  const addMobile = formData.get("add_mobile") === "1";
  const slugInput = formData.get("slug")?.toString()?.trim() || title || "";

  if (!title) return { error: "Title is required." };
  if (!body.replace(/<[^>]+>/g, "").trim()) return { error: "Page content is required." };

  const baseSlug = normalizePageSlug(slugInput);
  if (!baseSlug) {
    return {
      error: slugifyPageTitle(slugInput)
        ? "That URL is already used by the site. Choose a different page URL."
        : "Enter a page URL using letters and numbers.",
    };
  }

  try {
    const sql = getSql();
    const [before] = await sql`SELECT slug FROM site_pages WHERE id = ${id}::uuid LIMIT 1`;
    const previousSlug = (before as { slug: string } | undefined)?.slug ?? null;
    const slug = await uniqueSlug(sql, baseSlug, id);
    const href = `/${slug}`;

    await sql`
      UPDATE site_pages
      SET title = ${title}, slug = ${slug}, excerpt = ${excerpt}, body = ${body},
          cover_image_url = ${coverImageUrl},
          published_at = ${publish ? new Date().toISOString() : null},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;

    if (previousSlug && previousSlug !== slug) {
      await rewriteNavHrefs(`/${previousSlug}`, href);
    }

    const navItem = { id: randomUUID(), label: title, href };
    if (addDesktop) await appendNavItemIfMissing("desktop", navItem);
    if (addMobile) await appendNavItemIfMissing("mobile", { ...navItem, id: randomUUID() });

    revalidatePagePaths(slug, previousSlug);
    return { ok: true, slug };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update page." };
  }
}

export async function deletePage(id: string): Promise<{ ok: boolean }> {
  try {
    if (await adminDenied("pages")) return { ok: false };
    const sql = getSql();
    const [row] = await sql`SELECT slug FROM site_pages WHERE id = ${id}::uuid LIMIT 1`;
    const slug = (row as { slug: string } | undefined)?.slug ?? null;
    await sql`DELETE FROM site_pages WHERE id = ${id}::uuid`;
    if (slug) await removeNavHrefs(`/${slug}`);
    revalidatePagePaths(slug);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
