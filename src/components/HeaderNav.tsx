"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/nav-menu";

const linkClass =
  "font-medium text-[var(--color-chrome-foreground)] transition-colors hover:text-[var(--color-primary)]";

function NavAnchor({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}) {
  const href = item.href || "#";
  const extra = item.openInNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <Link href={href} className={className} onClick={onClick} {...extra}>
      {item.label}
    </Link>
  );
}

function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const children = item.children ?? [];

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-0.5 text-sm ${linkClass}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <span className="text-xs opacity-70" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
          role="menu"
        >
          {item.href && !children.some((c) => c.href === item.href) ? (
            <NavAnchor
              item={item}
              className="block px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-border)]"
              onClick={() => setOpen(false)}
            />
          ) : null}
          {children.map((child) => (
            <NavAnchor
              key={child.id}
              item={child}
              className="block px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--color-border)]"
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeaderNav({
  items,
  className = "",
}: {
  items: NavItem[];
  className?: string;
}) {
  return (
    <nav className={className} aria-label="Primary">
      {items.map((item) =>
        item.children && item.children.length > 0 ? (
          <Dropdown key={item.id} item={item} />
        ) : (
          <NavAnchor key={item.id} item={item} className={`text-sm ${linkClass}`} />
        )
      )}
    </nav>
  );
}