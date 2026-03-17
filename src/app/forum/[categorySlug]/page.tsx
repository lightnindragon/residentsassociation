import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { CreateThreadForm } from "./CreateThreadForm";

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  type CategoryRow = { id: string; name: string; slug: string };
  type ThreadRow = { id: string; title: string; created_at: string; author_name: string | null; pinned: boolean; locked: boolean };
  let category: CategoryRow | null = null;
  let threads: ThreadRow[] = [];
  try {
    const sql = getSql();
    const catRows = await sql`
      SELECT id, name, slug FROM forum_categories WHERE slug = ${categorySlug} LIMIT 1
    `;
    category = (catRows[0] as CategoryRow) ?? null;
    if (category) {
      const threadRows = await sql`
        SELECT t.id, t.title, t.created_at, t.pinned, t.locked, u.name AS author_name
        FROM forum_threads t
        LEFT JOIN users u ON u.id = t.author_id
        WHERE t.category_id = ${category.id}
        ORDER BY t.pinned DESC, t.created_at DESC
        LIMIT 100
      `;
      threads = threadRows as ThreadRow[];
    }
  } catch {
    // no DB
  }
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/forum" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Forum
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">{category.name}</h1>
      <CreateThreadForm categoryId={category.id} />
      <ul className="mt-8 divide-y divide-[var(--color-border)]">
        {threads.length === 0 ? (
          <li className="py-6 text-[var(--color-muted)]">No threads yet.</li>
        ) : (
          threads.map((t) => (
            <li key={t.id} className="py-4">
              <Link
                href={`/forum/${categorySlug}/${t.id}`}
                className="flex items-center gap-2 font-medium hover:underline"
              >
                {t.pinned && <Badge variant="warning">Pinned</Badge>}
                {t.locked && <Badge variant="muted">Locked</Badge>}
                {t.title}
              </Link>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {t.author_name ?? "Unknown"} ·{" "}
                {new Date(t.created_at).toLocaleDateString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
