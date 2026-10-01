"use server";

import { getSql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin-access";
import { parsePermissionsFromForm, type StoredAdminPermissions } from "@/lib/admin-permissions";

export async function addAdminUser(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  try {
    const actor = await requireAdminPermission("admins");
    const name = formData.get("name")?.toString()?.trim();
    const email = formData.get("email")?.toString()?.trim().toLowerCase();
    const password = formData.get("password")?.toString() ?? "";
    let role = formData.get("role")?.toString() === "dev" ? "dev" : "admin";
    if (role === "dev" && actor.role !== "dev") {
      return { error: "Only a dev account can create another dev." };
    }
    if (!name || !email) return { error: "Name and email required." };
    if (password.length < 10) return { error: "Password must be at least 10 characters." };
    const permissions = parsePermissionsFromForm(formData, role);
    const hash = await bcrypt.hash(password, 12);
    const sql = getSql();
    await sql`
      INSERT INTO users (email, password_hash, name, role, approved, admin_permissions)
      VALUES (${email}, ${hash}, ${name}, ${role}, true, ${permissions})
    `;
    revalidatePath("/admin/admins");
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("access") ? e.message : "Failed (email may already exist).";
    return { error: msg };
  }
}

export async function resetAdminPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdminPermission("admins");
    if (newPassword.length < 10) return { ok: false, error: "Min 10 characters." };
    const hash = await bcrypt.hash(newPassword, 12);
    const sql = getSql();
    await sql`
      UPDATE users SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed." };
  }
}

export async function updateAdminUser(
  userId: string,
  data: { name: string; email: string; role: string; permissions?: StoredAdminPermissions }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireAdminPermission("admins");
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    let role = data.role === "dev" ? "dev" : "admin";
    if (!name || !email) return { ok: false, error: "Name and email required." };

    const sql = getSql();
    const [existing] = await sql`
      SELECT role FROM users WHERE id = ${userId}::uuid AND role IN ('admin', 'dev') LIMIT 1
    `;
    const prev = existing as { role: string } | undefined;
    if (!prev) return { ok: false, error: "Administrator not found." };
    if (actor.role !== "dev" && (prev.role === "dev" || role === "dev")) {
      return { ok: false, error: "Only a dev account can change dev users." };
    }

    const permissions = role === "dev" ? null : data.permissions === undefined ? null : data.permissions;

    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, role = ${role},
          admin_permissions = ${permissions}, updated_at = NOW()
      WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed (email may already exist)." };
  }
}

export async function deleteAdminUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const actor = await requireAdminPermission("admins");
    const sql = getSql();

    const [target] = await sql`
      SELECT role FROM users WHERE id = ${userId}::uuid AND role IN ('admin', 'dev') LIMIT 1
    `;
    const prev = target as { role: string } | undefined;
    if (!prev) return { ok: false, error: "Administrator not found." };
    if (actor.role !== "dev" && prev.role === "dev") {
      return { ok: false, error: "Only a dev account can delete a dev user." };
    }

    const count = await sql`SELECT count(*) FROM users WHERE role IN ('admin', 'dev')`;
    if (Number((count[0] as { count: string }).count) <= 1) {
      return { ok: false, error: "Cannot delete the last administrator." };
    }

    await sql`
      DELETE FROM users WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete administrator." };
  }
}
