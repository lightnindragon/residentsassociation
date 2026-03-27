import { ADMIN_NAV_SECTIONS } from "@/lib/admin-nav";
import { AdminDesktopSidebar, AdminMobileNav } from "@/components/admin/AdminPanelNav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <AdminMobileNav sections={ADMIN_NAV_SECTIONS} />

      <div className="flex gap-8 py-8 lg:gap-10">
        <AdminDesktopSidebar sections={ADMIN_NAV_SECTIONS} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
