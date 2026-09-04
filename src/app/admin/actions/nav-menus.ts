"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  sanitizeNavItems,
  type NavMenuKey,
} from "@/lib/nav-menu";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin" && user?.role !== "dev") throw new Error("Admin only");
}

function isMenuKey(v: string): v is NavMenuKey {
  return v === "desktop" || v === "mobile";
}

export async function saveNavMenu(
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const keyRaw = formData.get("menu_key")?.toString() ?? "";
    if (!isMenuKey(keyRaw)) return { error: "Unknown menu." };

    const rawJson = formData.get("items")?.toString() ?? "[]";
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return { error: "Menu data was invalid." };
    }
    const items = sanitizeNavItems(parsed);
    const payload = JSON.stringify(items);

    const sql = getSql();
    await sql.query(
      `INSERT INTO nav_menus (menu_key, items, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (menu_key) DO UPDATE
       SET items = EXCLUDED.items, updated_at = NOW()`,
      [keyRaw, payload]
    );

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save menu." };
  }
}