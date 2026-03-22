"use server";

import { put, del } from "@vercel/blob";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveAboutIntro(intro: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO site_content (key, value) VALUES ('about_intro', ${intro})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save." };
  }
}

export async function addCommitteeMember(
  name: string,
  role: string,
  imageFile?: File | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    let imageUrl: string | null = null;
    if (imageFile?.size) {
      const blob = await put(`committee/${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });
      imageUrl = blob.url;
    }
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0)::int AS m FROM committee_members`;
    const nextOrder = ((maxOrder[0] as { m: number })?.m ?? 0) + 1;
    await sql`
      INSERT INTO committee_members (name, role, image_url, sort_order)
      VALUES (${name.trim()}, ${(role ?? "").trim()}, ${imageUrl}, ${nextOrder})
    `;
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to add member." };
  }
}

export async function updateCommitteeMember(
  id: string,
  name: string,
  role: string,
  imageFile?: File | null
): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    let imageUrl: string | null | undefined;
    if (imageFile?.size) {
      const [row] = await sql`SELECT image_url FROM committee_members WHERE id = ${id}::uuid LIMIT 1`;
      const oldUrl = (row as { image_url: string | null })?.image_url;
      if (oldUrl) await del(oldUrl).catch(() => {});
      const blob = await put(`committee/${Date.now()}-${imageFile.name}`, imageFile, { access: "public" });
      imageUrl = blob.url;
    }
    if (imageUrl !== undefined) {
      await sql`
        UPDATE committee_members SET name = ${name.trim()}, role = ${(role ?? "").trim()}, image_url = COALESCE(${imageUrl}, image_url)
        WHERE id = ${id}::uuid
      `;
    } else {
      await sql`
        UPDATE committee_members SET name = ${name.trim()}, role = ${(role ?? "").trim()}
        WHERE id = ${id}::uuid
      `;
    }
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to update." };
  }
}

export async function deleteCommitteeMember(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT image_url FROM committee_members WHERE id = ${id}::uuid LIMIT 1`;
    const url = (row as { image_url: string | null })?.image_url;
    if (url) await del(url).catch(() => {});
    await sql`DELETE FROM committee_members WHERE id = ${id}::uuid`;
    revalidatePath("/about");
    revalidatePath("/admin/about");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
