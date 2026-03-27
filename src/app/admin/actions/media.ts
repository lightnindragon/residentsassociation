"use server";

import { put, del } from "@vercel/blob";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadMediaAsset(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const file = formData.get("file") as File | null;
  const label = formData.get("label")?.toString()?.trim() ?? null;
  if (!file?.size) return { error: "Choose a file." };

  try {
    const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    const sql = getSql();
    await sql`
      INSERT INTO media_assets (url, label, source)
      VALUES (${blob.url}, ${label}, 'media')
    `;
    revalidatePath("/admin/media");
    return null;
  } catch (e) {
    console.error(e);
    return { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN." };
  }
}

export async function deleteMediaAsset(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT url FROM media_assets WHERE id = ${id}::uuid LIMIT 1
    `;
    const url = (row as { url: string })?.url;
    if (url) {
      try {
        await del(url);
      } catch {
        // blob may already be gone
      }
    }
    await sql`DELETE FROM media_assets WHERE id = ${id}::uuid`;
    revalidatePath("/admin/media");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete." };
  }
}

export async function deleteGalleryMediaItem(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT url FROM gallery_images WHERE id = ${id}::uuid LIMIT 1
    `;
    const url = (row as { url: string })?.url;
    if (url) {
      try {
        await del(url);
      } catch {
        // blob may already be gone
      }
    }
    await sql`DELETE FROM gallery_images WHERE id = ${id}::uuid`;
    try {
      await sql`DELETE FROM media_assets WHERE url = ${url}`;
    } catch {
      // media_assets table may not exist
    }
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/media");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete." };
  }
}
