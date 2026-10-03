"use server";

import { revalidatePath } from "next/cache";
import {
  persistNavMenu,
  sanitizeNavItems,
  type NavMenuKey,
} from "@/lib/nav-menu";
import { requireAdminPermission } from "@/lib/admin-access";

async function requireAdmin() {
  await requireAdminPermission("header-menus");
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
    await persistNavMenu(keyRaw, items);

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save menu." };
  }
}