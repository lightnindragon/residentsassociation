import Link from "next/link";
import { getSql } from "@/lib/db";
import { PostCategoryForm } from "./PostCategoryForm";

export default async function PostCategoriesPage() {
  let cats: Array<{
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    show_in_header: boolean;
  }> = [];
  try {
    const sql = getSql();
    cats = (await sql`
      SELECT id, name, slug, sort_order, show_in_header FROM post_categories ORDER BY sort_order, name
    `) as typeof cats;
  } catch {
    // no DB
  }

  return (
    <div>
      <Link href="/admin/news" className="text-sm text-[var(--color-primary)] hover:underline">
        ← News
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Blog Categories</h1>
      <PostCategoryForm />
      <ul className="mt-8 space-y-2">
        {cats.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded border border-[var(--color-border)] px-4 py-2 text-sm"
          >
            <span>
              {c.name}{" "}
              <span className="text-[var(--color-muted)]">/news/category/{c.slug}</span>
            </span>
            {c.show_in_header && (
              <span className="text-xs text-[var(--color-primary)]">In header</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
