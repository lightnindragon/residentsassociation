"use server";

import { getSql } from "@/lib/db";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function addCategory(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const name = formData.get("name")?.toString()?.trim();
  const slugInput = formData.get("slug")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() ?? null;
  const sort_order = parseInt(formData.get("sort_order")?.toString() ?? "0", 10);

  if (!name) return { error: "Name is required." };
  const slug = slugInput ? slugify(slugInput) : slugify(name);

  try {
    const sql = getSql();
    await sql`
      INSERT INTO forum_categories (name, slug, description, sort_order)
      VALUES (${name}, ${slug}, ${description}, ${sort_order})
    `;
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Failed to add category (slug may be in use)." };
  }
}
