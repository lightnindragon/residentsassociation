"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const r = (session?.user as { role?: string })?.role;
  if (r !== "admin" && r !== "dev") throw new Error("Forbidden");
}

export async function addAdminUser(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  try {
    await requireAdmin();
    const name = formData.get("name")?.toString()?.trim();
    const email = formData.get("email")?.toString()?.trim().toLowerCase();
    const password = formData.get("password")?.toString() ?? "";
    const role = formData.get("role")?.toString() === "dev" ? "dev" : "admin";
    if (!name || !email) return { error: "Name and email required." };
    if (password.length < 10) return { error: "Password must be at least 10 characters." };
    const hash = await bcrypt.hash(password, 12);
    const sql = getSql();
    await sql`
      INSERT INTO users (email, password_hash, name, role, approved)
      VALUES (${email}, ${hash}, ${name}, ${role}, true)
    `;
    revalidatePath("/admin/admins");
    return { success: true };
  } catch {
    return { error: "Failed (email may already exist)." };
  }
}

export async function resetAdminPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (newPassword.length < 10) return { ok: false, error: "Min 10 characters." };
    const hash = await bcrypt.hash(newPassword, 12);
    const sql = getSql();
    await sql`
      UPDATE users SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed." };
  }
}

export async function updateAdminUser(
  userId: string,
  data: { name: string; email: string; role: string }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const role = data.role === "dev" ? "dev" : "admin";
    
    if (!name || !email) return { ok: false, error: "Name and email required." };
    
    const sql = getSql();
    await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, role = ${role}, updated_at = NOW()
      WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed (email may already exist)." };
  }
}

export async function deleteAdminUser(userId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    
    // Check we aren't deleting the last admin
    const count = await sql`SELECT count(*) FROM users WHERE role IN ('admin', 'dev')`;
    if (Number(count[0].count) <= 1) {
      return { ok: false, error: "Cannot delete the last administrator." };
    }
    
    await sql`
      DELETE FROM users WHERE id = ${userId}::uuid AND role IN ('admin', 'dev')
    `;
    revalidatePath("/admin/admins");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete administrator." };
  }
}
