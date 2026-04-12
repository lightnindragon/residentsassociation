"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { HeaderNewsCategory } from "@/lib/news-nav";

type MobileNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  categories: HeaderNewsCategory[];
  signOutAction: () => Promise<void>;
  /** `dark` — hamburger on slate header */
  tone?: "light" | "dark";
};

export function MobileNav({
  isLoggedIn,
  isAdmin,
  categories,
  signOutAction,
  tone = "light",
}: MobileNavProps) {
  const bar = tone === "dark" ? "bg-white" : "bg-[var(--foreground)]";
  const hit = tone === "dark" ? "hover:bg-white/10" : "hover:bg-[var(--color-surface)]";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/25"
            onClick={close}
            aria-hidden
          />

          {/* Drawer */}
          <div className="absolute left-0 right-0 top-full z-50 max-h-[80vh] overflow-y-auto border-b border-[var(--color-border)] bg-white shadow-xl">
            <nav aria-label="Mobile navigation">
              {/* Main links */}
              <div className="flex flex-col divide-y divide-[var(--color-border)] px-5 py-1">
                <MobLink href="/" onClick={close}>Home</MobLink>
                <MobLink href="/news" onClick={close}>News</MobLink>
                <MobLink href="/planning-applications" onClick={close}>
                  Planning
                </MobLink>
                <MobLink href="/agendas" onClick={close}>
                  Agendas
                </MobLink>
                <MobLink href="/minutes" onClick={close}>
                  Minutes
                </MobLink>
                <MobLink href="/events" onClick={close}>
                  Events
                </MobLink>
                {categories.map((c) => (
                  <MobLink
                    key={c.slug}
                    href={`/news/category/${c.slug}`}
                    onClick={close}
                    sub
                  >
                    {c.name}
                  </MobLink>
                ))}
                <MobLink href="/gallery" onClick={close}>Gallery</MobLink>
                <MobLink href="/contact" onClick={close}>Contact</MobLink>
                <MobLink href="/about" onClick={close}>About</MobLink>
              </div>

              {/* Auth links */}
              <div className="flex flex-col divide-y divide-[var(--color-border)] border-t-2 border-[var(--color-surface-strong)] px-5 py-1">
                {isLoggedIn ? (
                  <>
                    <MobLink href="/account" onClick={close}>Account</MobLink>
                    <MobLink href="/forum" onClick={close}>Forum</MobLink>
                    {isAdmin && (
                      <MobLink href="/admin" onClick={close} accent>
                        Admin
                      </MobLink>
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
                    <MobLink href="/login" onClick={close}>Sign in</MobLink>
                    <MobLink href="/signup" onClick={close} accent>
                      Sign up
                    </MobLink>
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
  href,
  onClick,
  children,
  sub,
  accent,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  sub?: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`py-4 text-sm font-medium ${
        accent
          ? "text-[var(--color-primary)] hover:underline"
          : sub
          ? "pl-4 text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          : "text-[var(--foreground)] hover:text-[var(--color-primary)]"
      }`}
    >
      {children}
    </Link>
  );
}
