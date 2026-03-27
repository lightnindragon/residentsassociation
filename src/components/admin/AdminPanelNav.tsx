"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavItem, AdminNavSection } from "@/lib/admin-nav";

function adminNavItemActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/admin") return path === "/admin";
  return path === h || path.startsWith(`${h}/`);
}

function NavLink({ href, label, pathname }: AdminNavItem & { pathname: string }) {
  const active = adminNavItemActive(pathname, href);
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
          : "text-[var(--foreground)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function AdminMobileNav({ sections }: { sections: AdminNavSection[] }) {
  const pathname = usePathname();
  const items = sections.flatMap((s) => s.items);
  return (
    <div className="sticky top-[calc(var(--header-height,4rem)+1px)] z-30 -mx-4 border-b border-[var(--color-border)] bg-[var(--background)] px-4 md:hidden">
      <nav
        className="flex gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Admin navigation"
      >
        {items.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              adminNavItemActive(pathname, href)
                ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                : "text-[var(--foreground)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)]"
            }`}
            aria-current={adminNavItemActive(pathname, href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AdminDesktopSidebar({ sections }: { sections: AdminNavSection[] }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-56 shrink-0 lg:w-60 md:block">
      <div className="sticky top-8 max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-sm">
        <p className="border-b border-[var(--color-border)] px-3 pb-3 font-heading text-sm font-semibold text-[var(--foreground)]">
          Admin
        </p>
        <nav className="mt-3 space-y-4" aria-label="Admin navigation">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                {section.title}
              </h2>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink {...item} pathname={pathname} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
