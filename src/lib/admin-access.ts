import { cache } from "react";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import type { AdminPermissionKey } from "@/lib/admin-nav";
import {
  hasAdminPermission,
  type StoredAdminPermissions,
} from "@/lib/admin-permissions";

export type AdminAccess = {
  id: string;
  role: string;
  permissions: StoredAdminPermissions;
};

export const getAdminAccess = cache(async (): Promise<AdminAccess | null> => {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || (user.role !== "admin" && user.role !== "dev")) return null;
  try {
    const sql = getSql();
    const [row] = await sql`
      SELECT role, admin_permissions FROM users WHERE id = ${user.id}::uuid LIMIT 1
    `;
    const data = row as { role: string; admin_permissions: string[] | null } | undefined;
    if (!data) return { id: user.id, role: user.role, permissions: null };
    return {
      id: user.id,
      role: data.role || user.role,
      permissions: data.admin_permissions ?? null,
    };
  } catch {
    return { id: user.id, role: user.role, permissions: null };
  }
});

export async function requireAdmin(): Promise<AdminAccess> {
  const access = await getAdminAccess();
  if (!access) throw new Error("Admin only");
  return access;
}

export async function requireAdminPermission(key: AdminPermissionKey): Promise<AdminAccess> {
  const access = await requireAdmin();
  if (!hasAdminPermission(access.role, access.permissions, key)) {
    throw new Error("You don't have access to this section.");
  }
  return access;
}

export async function adminDenied(key: AdminPermissionKey): Promise<string | null> {
  try {
    await requireAdminPermission(key);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "You don't have access to this section.";
  }
}
