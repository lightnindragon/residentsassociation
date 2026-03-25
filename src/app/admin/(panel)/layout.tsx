import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/residents", label: "Residents" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/forum", label: "Forum" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/about", label: "About us" },
  { href: "/admin/contact", label: "Contact page" },
  { href: "/admin/social", label: "Social links" },
  { href: "/admin/email-templates", label: "Email templates" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Mobile nav — horizontal scrollable strip */}
      <div className="sticky top-[calc(var(--header-height,4rem)+1px)] z-30 -mx-4 border-b border-[var(--color-border)] bg-[var(--background)] px-4 md:hidden">
        <nav
          className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Admin navigation"
        >
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop layout: sidebar + content */}
      <div className="flex gap-8 py-8">
        <aside className="hidden w-48 shrink-0 border-r border-[var(--color-border)] pr-6 md:block">
          <nav className="flex flex-col gap-1" aria-label="Admin navigation">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
