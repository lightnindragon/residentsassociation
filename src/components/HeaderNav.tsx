"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/nav-menu";

const linkClass =
  "font-medium text-[var(--color-chrome-foreground)] transition-colors hover:text-[var(--color-primary)]";

const menuItemClass =
  "block w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--color-border)]";

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

function hasChildren(item: NavItem): boolean {
  return (item.children?.length ?? 0) > 0;
}

function parentLinkIfNeeded(item: NavItem): NavItem | null {
  const children = item.children ?? [];
  if (!item.href) return null;
  if (children.some((c) => c.href === item.href)) return null;
  return item;
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

  const parentLink = parentLinkIfNeeded(item);

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
          {parentLink ? (
            <NavAnchor item={parentLink} className={menuItemClass} onClick={() => setOpen(false)} />
          ) : null}
          {children.map((child) =>
            hasChildren(child) ? (
              <Flyout key={child.id} item={child} onClose={() => setOpen(false)} />
            ) : (
              <NavAnchor
                key={child.id}
                item={child}
                className={menuItemClass}
                onClick={() => setOpen(false)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function Flyout({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const children = item.children ?? [];
  const parentLink = parentLinkIfNeeded(item);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${menuItemClass} flex items-center justify-between gap-3`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span>{item.label}</span>
        <span className="text-xs opacity-70" aria-hidden>
          ▸
        </span>
      </button>
      {open && (
        <div
          className="absolute left-full top-0 z-50 ml-0.5 min-w-[14rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-lg"
          role="menu"
        >
          {parentLink ? (
            <NavAnchor item={parentLink} className={menuItemClass} onClick={onClose} />
          ) : null}
          {children.map((child) => (
            <NavAnchor key={child.id} item={child} className={menuItemClass} onClick={onClose} />
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
        hasChildren(item) ? (
          <Dropdown key={item.id} item={item} />
        ) : (
          <NavAnchor key={item.id} item={item} className={`text-sm ${linkClass}`} />
        )
      )}
    </nav>
  );
}
