"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import type { NavItem } from "@/lib/nav-menu";

type MobileNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  items: NavItem[];
  signOutAction: () => Promise<void>;
  /** `dark` — hamburger on slate header */
  tone?: "light" | "dark";
};

export function MobileNav({
  isLoggedIn,
  isAdmin,
  items,
  signOutAction,
  tone = "light",
}: MobileNavProps) {
  const bar = tone === "dark" ? "bg-white" : "bg-[var(--foreground)]";
  const hit = tone === "dark" ? "hover:bg-white/10" : "hover:bg-[var(--color-surface)]";
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setOpenId(null);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg ${hit}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-5 rounded-full ${bar} transition-all duration-200 ${
            open ? "translate-y-[7px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full ${bar} transition-all duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 rounded-full ${bar} transition-all duration-200 ${
            open ? "-translate-y-[7px] -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/25"
            onClick={close}
            aria-hidden
          />

          <div className="absolute left-0 right-0 top-full z-50 max-h-[80vh] overflow-y-auto border-b border-[var(--color-border)] bg-white shadow-xl">
            <nav aria-label="Mobile navigation">
              <div className="flex flex-col divide-y divide-[var(--color-border)] px-5 py-1">
                {items.map((item) => {
                  const children = item.children ?? [];
                  if (children.length === 0) {
                    return (
                      <MobLink key={item.id} item={item} onClick={close} />
                    );
                  }
                  const expanded = openId === item.id;
                  return (
                    <div key={item.id} className="py-0">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--color-primary)]"
                        aria-expanded={expanded}
                        onClick={() => setOpenId((id) => (id === item.id ? null : item.id))}
                      >
                        {item.label}
                        <span className="text-xs opacity-70" aria-hidden>
                          ▾
                        </span>
                      </button>
                      {expanded && (
                        <div className="flex flex-col border-t border-[var(--color-border)] bg-[var(--color-surface)]/40">
                          {item.href && !children.some((c) => c.href === item.href) ? (
                            <MobLink item={item} onClick={close} sub />
                          ) : null}
                          {children.map((child) => (
                            <MobLink key={child.id} item={child} onClick={close} sub />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col divide-y divide-[var(--color-border)] border-t-2 border-[var(--color-surface-strong)] px-5 py-1">
                {isLoggedIn ? (
                  <>
                    <MobHref href="/account" onClick={close}>
                      Account
                    </MobHref>
                    <MobHref href="/forum" onClick={close}>
                      Forum
                    </MobHref>
                    {isAdmin && (
                      <MobHref href="/admin" onClick={close} accent>
                        Admin
                      </MobHref>
                    )}
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full py-4 text-left text-sm font-medium text-[var(--color-muted)] hover:text-[var(--foreground)]"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <MobHref href="/login" onClick={close}>
                      Sign in
                    </MobHref>
                    <MobHref href="/signup" onClick={close} accent>
                      Sign up
                    </MobHref>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

function MobLink({
  item,
  onClick,
  sub,
  accent,
}: {
  item: NavItem;
  onClick: () => void;
  sub?: boolean;
  accent?: boolean;
}) {
  const extra = item.openInNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <Link
      href={item.href || "#"}
      onClick={onClick}
      className={`py-4 text-sm font-medium ${
        accent
          ? "text-[var(--color-primary)] hover:underline"
          : sub
          ? "pl-4 text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          : "text-[var(--foreground)] hover:text-[var(--color-primary)]"
      }`}
      {...extra}
    >
      {item.label}
    </Link>
  );
}

function MobHref({
  href,
  onClick,
  children,
  accent,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`py-4 text-sm font-medium ${
        accent
          ? "text-[var(--color-primary)] hover:underline"
          : "text-[var(--foreground)] hover:text-[var(--color-primary)]"
      }`}
    >
      {children}
    </Link>
  );
}