"use server";

import { put } from "@vercel/blob";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function uploadBlogImage(
  _prev: { error?: string; url?: string } | null,
  formData: FormData
): Promise<{ error?: string; url?: string } | null> {
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "Choose a file." };

  try {
    const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    const sql = getSql();
    try {
      await sql`
        INSERT INTO media_assets (url, label, source)
        VALUES (${blob.url}, ${file.name}, 'blog')
      `;
    } catch {
      // media_assets table may not exist on older DBs
    }
    revalidatePath("/admin/media");
    return { url: blob.url };
  } catch (e) {
    console.error(e);
    return { error: "Upload failed. Check BLOB_READ_WRITE_TOKEN." };
  }
}
