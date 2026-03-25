import { getSql } from "@/lib/db";
import { AddCategoryForm } from "./AddCategoryForm";
import { AddAreaForm } from "./AddAreaForm";
import { EditAreaRow } from "./EditAreaRow";
import { EditCategoryRow } from "./EditCategoryRow";

export default async function AdminForumPage() {
  let areas: Array<{ id: string; name: string; slug: string; description: string | null; sort_order: number }> = [];
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    area_id: string;
    area_slug: string;
    area_name: string;
  }> = [];
  try {
    const sql = getSql();
    areas = (await sql`
      SELECT id, name, slug, description, sort_order FROM forum_areas ORDER BY sort_order ASC, name ASC
    `) as typeof areas;
    categories = (await sql`
      SELECT c.id, c.name, c.slug, c.description, c.sort_order, c.area_id, a.slug AS area_slug, a.name AS area_name
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
        Forum areas &amp; categories
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Public URLs look like <code className="rounded bg-[var(--color-border)] px-1">/forum/area-slug/category-slug</code>.
      </p>

      {/* Add forms */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <AddAreaForm />
        <AddCategoryForm areas={areas} />
      </div>

      {/* Areas list */}
      <section className="mt-10">
        <h2 className="mb-3 font-heading text-lg font-semibold text-[var(--foreground)]">Areas</h2>
        {areas.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No areas yet.</p>
        ) : (
          <ul className="space-y-2">
            {areas.map((a) => (
              <EditAreaRow key={a.id} area={a} />
            ))}
          </ul>
        )}
      </section>

      {/* Categories list */}
      <section className="mt-10">
        <h2 className="mb-3 font-heading text-lg font-semibold text-[var(--foreground)]">Categories</h2>
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No categories yet. Add an area first, then a category.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((c) => (
              <EditCategoryRow key={c.id} category={c} areas={areas} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
