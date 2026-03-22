import { getSql } from "@/lib/db";
import { AddCategoryForm } from "./AddCategoryForm";
import { AddAreaForm } from "./AddAreaForm";

export default async function AdminForumPage() {
  let areas: Array<{ id: string; name: string; slug: string; sort_order: number }> = [];
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    area_slug: string;
    area_name: string;
  }> = [];
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT id, name, slug, sort_order FROM forum_areas ORDER BY sort_order ASC, name ASC
    `) as typeof areas;
    categories = (await sql`
      SELECT c.id, c.name, c.slug, c.description, c.sort_order, a.slug AS area_slug, a.name AS area_name
      FROM forum_categories c
      JOIN forum_areas a ON a.id = c.area_id
      ORDER BY a.sort_order ASC, c.sort_order ASC, c.name ASC
    `) as typeof categories;
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Forum areas & categories
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Public URLs look like <code className="rounded bg-[var(--color-border)] px-1">/forum/area-slug/category-slug</code>.
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <AddAreaForm />
        <AddCategoryForm areas={areas} />
      </div>
      <ul className="mt-8 space-y-2">
        {categories.length === 0 ? (
          <li className="text-sm text-[var(--color-muted)]">No categories yet. Add an area first, then a category.</li>
        ) : (
          categories.map((c) => (
            <li
              key={c.id}
              className="flex flex-col rounded-lg border border-[var(--color-border)] px-4 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-sm text-[var(--color-muted)]">
                  {c.area_name} · /forum/{c.area_slug}/{c.slug}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
