export type AdminPermissionKey =
  | "dashboard"
  | "calendar"
  | "messages"
  | "residents"
  | "mailing-list"
  | "news-updates"
  | "admins"
  | "news"
  | "planning-applications"
  | "agendas"
  | "minutes"
  | "events"
  | "forum"
  | "gallery"
  | "media"
  | "homepage"
  | "header-menus"
  | "about"
  | "contact"
  | "social"
  | "email-templates"
  | "donations"
  | "settings";

export type AdminNavItem = {
  href: string;
  label: string;
  key: AdminPermissionKey;
};

export type AdminNavSection = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", key: "dashboard" },
      { href: "/admin/calendar", label: "Calendar", key: "calendar" },
    ],
  },
  {
    title: "People & Comms",
    items: [
      { href: "/admin/messages", label: "Messages", key: "messages" },
      { href: "/admin/residents", label: "Residents", key: "residents" },
      { href: "/admin/mailing-list", label: "Mailing List", key: "mailing-list" },
      { href: "/admin/news-updates", label: "News Updates", key: "news-updates" },
      { href: "/admin/admins", label: "Admins", key: "admins" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/news", label: "News", key: "news" },
      { href: "/admin/planning-applications", label: "Planning Applications", key: "planning-applications" },
      { href: "/admin/agendas", label: "Agendas", key: "agendas" },
      { href: "/admin/minutes", label: "Minutes", key: "minutes" },
      { href: "/admin/events", label: "Events", key: "events" },
      { href: "/admin/forum", label: "Forum", key: "forum" },
      { href: "/admin/gallery", label: "Gallery", key: "gallery" },
      { href: "/admin/media", label: "Media", key: "media" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", key: "homepage" },
      { href: "/admin/header-menus", label: "Header Menus", key: "header-menus" },
      { href: "/admin/about", label: "About Us", key: "about" },
      { href: "/admin/contact", label: "Contact Page", key: "contact" },
      { href: "/admin/social", label: "Social Links", key: "social" },
    ],
  },
  {
    title: "Email & Payments",
    items: [
      { href: "/admin/email-templates", label: "Email Templates", key: "email-templates" },
      { href: "/admin/donations", label: "Donations", key: "donations" },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", key: "settings" }],
  },
];

export const ASSIGNABLE_ADMIN_PERMISSIONS: Array<{
  key: Exclude<AdminPermissionKey, "dashboard">;
  label: string;
  section: string;
}> = ADMIN_NAV_SECTIONS.flatMap((section) =>
  section.items
    .filter((item) => item.key !== "dashboard")
    .map((item) => ({ key: item.key as Exclude<AdminPermissionKey, "dashboard">, label: item.label, section: section.title }))
);

export function flattenAdminNav(sections: AdminNavSection[]): AdminNavItem[] {
  return sections.flatMap((s) => s.items);
}

export function permissionKeyFromPath(pathname: string): AdminPermissionKey {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/admin") return "dashboard";
  const items = flattenAdminNav(ADMIN_NAV_SECTIONS)
    .filter((item) => item.href !== "/admin")
    .sort((a, b) => b.href.length - a.href.length);
  const match = items.find((item) => path === item.href || path.startsWith(`${item.href}/`));
  return match?.key ?? "dashboard";
}
