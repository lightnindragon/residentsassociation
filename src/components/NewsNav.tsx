"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import type { HeaderNewsCategory } from "@/lib/news-nav";

export function NewsNav({ categories }: { categories: HeaderNewsCategory[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (!categories.length) {
    return (
      <Link
        href="/news"
        className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
      >
        News
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-0.5 text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        News
        <span className="text-xs opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/news"
            className="block px-3 py-2 text-sm hover:bg-[var(--color-border)]"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            All news
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/news/category/${c.slug}`}
              className="block px-3 py-2 text-sm hover:bg-[var(--color-border)]"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
