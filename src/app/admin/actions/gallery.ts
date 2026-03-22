"use server";

import { put, del } from "@vercel/blob";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadImage(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption")?.toString()?.trim() ?? null;
  if (!file?.size) return { error: "Choose a file." };

  try {
    const blob = await put(`gallery/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    const sql = getSql();
    await sql`
      INSERT INTO gallery_images (url, caption)
      VALUES (${blob.url}, ${caption})
    `;
    try {
      await sql`
        INSERT INTO media_assets (url, label, source)
        VALUES (${blob.url}, ${caption}, 'gallery')
      `;
    } catch {
      // media_assets table may not exist on older DBs
    }
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/media");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN." };
  }
}

export async function deleteImage(id: string): Promise<{ ok: boolean }> {
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT url FROM gallery_images WHERE id = ${id}::uuid LIMIT 1
    `;
    const url = (row as { url: string })?.url;
    if (url) {
      await del(url);
    }
    await sql`DELETE FROM gallery_images WHERE id = ${id}::uuid`;
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
