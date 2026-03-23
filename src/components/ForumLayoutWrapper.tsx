"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ForumLayoutWrapper({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  if (pathname === "/forum/setup") {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col md:flex-row gap-8 px-4 py-8 sm:px-6">
      <aside className="hidden w-48 shrink-0 md:block pt-4 border-r border-[var(--color-border)] pr-6">
        {sidebar}
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}