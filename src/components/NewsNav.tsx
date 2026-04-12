"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { HeaderNewsCategory } from "@/lib/news-nav";

const contentLinks = [
  { href: "/events", label: "Events" },
  { href: "/planning-applications", label: "Planning" },
  { href: "/agendas", label: "Agendas" },
  { href: "/minutes", label: "Minutes" },
] as const;

export function NewsNav({
  categories,
  tone = "light",
}: {
  categories: HeaderNewsCategory[];
  /** `dark` — light text on slate header */
  tone?: "light" | "dark";
}) {
  const triggerClass =
    tone === "dark"
      ? "text-sm font-medium text-white/90 transition-colors hover:text-[var(--color-primary-muted)]"
      : "text-sm font-medium text-[var(--color-chrome-foreground)] transition-colors hover:text-[var(--color-primary)]";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const itemClass =
    "block px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-border)]";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-0.5 ${triggerClass}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="news-nav-menu"
      >
        News
        <span className="text-xs opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div
          id="news-nav-menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/news"
            className={itemClass}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            All news
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/news/category/${c.slug}`}
              className={itemClass}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {c.name}
            </Link>
          ))}
          <div className="my-1 border-t border-[var(--color-border)]" role="separator" />
          {contentLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={itemClass}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
