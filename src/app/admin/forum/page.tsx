import Link from "next/link";
import { getSql } from "@/lib/db";
import { AddCategoryForm } from "./AddCategoryForm";

export default async function AdminForumPage() {
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
  }> = [];
  try {
    const sql = getSql();
    categories = (await sql`
      SELECT id, name, slug, description, sort_order
      FROM forum_categories
      ORDER BY sort_order ASC, name ASC
    `) as typeof categories;
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Forum categories
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Manage forum categories. Threads and posts are visible in the forum.
      </p>
      <AddCategoryForm />
      <ul className="mt-8 space-y-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-2"
          >
            <div>
              <span className="font-medium">{c.name}</span>
              <span className="ml-2 text-sm text-[var(--color-muted)]">
                /forum/{c.slug}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
