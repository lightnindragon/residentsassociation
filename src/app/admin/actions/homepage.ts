"use server";

import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const r = (session?.user as { role?: string })?.role;
  if (r !== "admin" && r !== "dev") throw new Error("Forbidden");
}

export async function saveHomepageContent(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const intro = formData.get("intro")?.toString() ?? "";
    const heroAlt = formData.get("heroAlt")?.toString() ?? "";
    const getInvolvedTitle = formData.get("getInvolvedTitle")?.toString() ?? "";
    const getInvolvedSubtitle = formData.get("getInvolvedSubtitle")?.toString() ?? "";
    const heroUrlField = formData.get("heroUrl")?.toString() ?? "";
    const file = formData.get("heroFile") as File | null;

    const sql = getSql();

    const upsert = async (key: string, value: string) => {
      await sql`
        INSERT INTO site_content (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    };

    await upsert("home_intro", intro);
    await upsert("home_hero_image_alt", heroAlt);
    await upsert("home_get_involved_title", getInvolvedTitle);
    await upsert("home_get_involved_subtitle", getInvolvedSubtitle);

    if (file && file.size > 0) {
      const [row] = await sql`SELECT value FROM site_content WHERE key = 'home_hero_image_url' LIMIT 1`;
      const oldUrl = (row as { value: string } | undefined)?.value?.trim();
      if (oldUrl?.startsWith("http")) {
        await del(oldUrl).catch(() => {});
      }
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await put(`site/home-hero-${Date.now()}-${safe}`, file, {
        access: "public",
      });
      await upsert("home_hero_image_url", blob.url);
    } else {
      await upsert("home_hero_image_url", heroUrlField.trim());
    }

    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true };
  } catch (e) {
    console.error(e);
    if (e instanceof Error && e.message === "Forbidden") {
      return { error: "Permission denied." };
    }
    return { error: "Failed to save homepage." };
  }
}
