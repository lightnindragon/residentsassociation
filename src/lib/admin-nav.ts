export type AdminNavItem = { href: string; label: string };

export type AdminNavSection = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    title: "People & comms",
    items: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/residents", label: "Residents" },
      { href: "/admin/news-updates", label: "News updates" },
      { href: "/admin/admins", label: "Admins" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/news", label: "News" },
      { href: "/admin/forum", label: "Forum" },
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/about", label: "About us" },
      { href: "/admin/contact", label: "Contact page" },
      { href: "/admin/social", label: "Social links" },
    ],
  },
  {
    title: "Email & payments",
    items: [
      { href: "/admin/email-templates", label: "Email templates" },
      { href: "/admin/donations", label: "Donations" },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

export function flattenAdminNav(sections: AdminNavSection[]): AdminNavItem[] {
  return sections.flatMap((s) => s.items);
}
