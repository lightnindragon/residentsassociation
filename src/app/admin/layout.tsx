import Link from "next/link";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/forum", label: "Forum" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="w-48 shrink-0 border-r border-[var(--color-border)] pr-6">
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--color-border)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
