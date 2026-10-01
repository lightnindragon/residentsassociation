import { headers } from "next/headers";
import Link from "next/link";
import { ADMIN_NAV_SECTIONS } from "@/lib/admin-nav";
import { AdminDesktopSidebar, AdminMobileNav } from "@/components/admin/AdminPanelNav";
import { getAdminAccess } from "@/lib/admin-access";
import { canAccessAdminPath, filterAdminNav } from "@/lib/admin-permissions";

export const maxDuration = 300;

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess();
  const sections = filterAdminNav(
    access?.role ?? "admin",
    access?.permissions ?? null,
    ADMIN_NAV_SECTIONS
  );
  const hdrs = await headers();
  const pathname = hdrs.get("x-admin-path") || "/admin";
  const allowed =
    !access ||
    canAccessAdminPath(pathname, access.role, access.permissions);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <AdminMobileNav sections={sections} />

      <div className="flex gap-8 py-8 lg:gap-10">
        <AdminDesktopSidebar sections={sections} />
        <div className="min-w-0 flex-1">
          {allowed ? (
            children
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
              <h1 className="font-heading text-xl font-semibold">No access</h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                You don&apos;t have permission to open this part of the admin panel.
                Ask a full admin to tick it on your account.
              </p>
              <Link
                href="/admin"
                className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Back to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
