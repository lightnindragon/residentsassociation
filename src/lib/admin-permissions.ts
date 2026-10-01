import {
  ADMIN_NAV_SECTIONS,
  type AdminNavSection,
  type AdminPermissionKey,
  permissionKeyFromPath,
} from "@/lib/admin-nav";

export type StoredAdminPermissions = string[] | null;

export function isFullAdminAccess(role: string, stored: StoredAdminPermissions): boolean {
  return role === "dev" || stored == null;
}

export function hasAdminPermission(
  role: string,
  stored: StoredAdminPermissions,
  key: AdminPermissionKey
): boolean {
  if (role !== "admin" && role !== "dev") return false;
  if (key === "dashboard") return true;
  if (isFullAdminAccess(role, stored)) return true;
  return Array.isArray(stored) && stored.includes(key);
}

export function canAccessAdminPath(
  pathname: string,
  role: string,
  stored: StoredAdminPermissions
): boolean {
  return hasAdminPermission(role, stored, permissionKeyFromPath(pathname));
}

export function filterAdminNav(
  role: string,
  stored: StoredAdminPermissions,
  sections: AdminNavSection[] = ADMIN_NAV_SECTIONS
): AdminNavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasAdminPermission(role, stored, item.key)),
    }))
    .filter((section) => section.items.length > 0);
}

export function parsePermissionsFromForm(
  formData: FormData,
  role: string
): StoredAdminPermissions {
  if (role === "dev") return null;
  if (formData.get("permissions_all") === "1") return null;
  const keys = formData
    .getAll("permissions")
    .map((v) => v.toString())
    .filter((k) => k && k !== "dashboard");
  return keys;
}
