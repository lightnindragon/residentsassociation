"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin-access";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireAdmin() {
  await requireAdminPermission("news");
}

export async function addPostCategory(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  await requireAdmin();
  const name = formData.get("name")?.toString()?.trim();
  const slugIn = formData.get("slug")?.toString()?.trim();
  const sort_order = parseInt(formData.get("sort_order")?.toString() ?? "0", 10);
  const show_in_header = formData.get("show_in_header") === "1";
  if (!name) return { error: "Name required." };
  const slug = slugIn ? slugify(slugIn) : slugify(name);
  try {
    const sql = getSql();
    await sql`
      INSERT INTO post_categories (name, slug, sort_order, show_in_header)
      VALUES (${name}, ${slug}, ${sort_order}, ${show_in_header})
    `;
    revalidatePath("/admin/news/categories");
    revalidatePath("/news");
    return null;
  } catch {
    return { error: "Failed (slug may exist)." };
  }
}
