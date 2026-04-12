export type AdminNavItem = { href: string; label: string };

export type AdminNavSection = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    title: "People & Comms",
    items: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/residents", label: "Residents" },
      { href: "/admin/news-updates", label: "News Updates" },
      { href: "/admin/admins", label: "Admins" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/news", label: "News" },
      { href: "/admin/planning-applications", label: "Planning Applications" },
      { href: "/admin/agendas", label: "Agendas" },
      { href: "/admin/minutes", label: "Minutes" },
      { href: "/admin/events", label: "Events" },
      { href: "/admin/forum", label: "Forum" },
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage" },
      { href: "/admin/about", label: "About Us" },
      { href: "/admin/contact", label: "Contact Page" },
      { href: "/admin/social", label: "Social Links" },
    ],
  },
  {
    title: "Email & Payments",
    items: [
      { href: "/admin/email-templates", label: "Email Templates" },
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
