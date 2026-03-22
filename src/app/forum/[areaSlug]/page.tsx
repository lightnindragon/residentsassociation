import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui";
import { auth } from "@/lib/auth";
import { isFollowing } from "@/app/forum/actions/follow";
import { ForumFollowButton } from "@/components/ForumFollowButton";

export default async function ForumAreaPage({
  params,
}: {
  params: Promise<{ areaSlug: string }>;
}) {
  const { areaSlug } = await params;
  type AreaRow = { id: string; name: string; slug: string; description: string | null };
  type CatRow = { id: string; name: string; slug: string; description: string | null; sort_order: number };
  let area: AreaRow | null = null;
  let categories: CatRow[] = [];
  try {
    const sql = getSql();
    const aRows = await sql`
      SELECT id, name, slug, description FROM forum_areas WHERE slug = ${areaSlug} LIMIT 1
    `;
    area = (aRows[0] as AreaRow) ?? null;
    if (area) {
      const cRows = await sql`
        SELECT id, name, slug, description, sort_order
        FROM forum_categories
        WHERE area_id = ${area.id}
        ORDER BY sort_order ASC, name ASC
      `;
      categories = cRows as CatRow[];
    }
  } catch {
    // no DB
  }
  if (!area) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const followingArea = userId ? await isFollowing("area", area.id) : false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link href="/forum" className="text-[var(--color-primary)] hover:underline">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{area.name}</span>
      </nav>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)]">
        {area.name}
      </h1>
      {area.description && (
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">{area.description}</p>
      )}
      {userId && (
        <div className="mt-3">
          <ForumFollowButton
            targetType="area"
            targetId={area.id}
            userId={userId}
            initialFollowing={followingArea}
          />
        </div>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {categories.length === 0 ? (
          <p className="text-[var(--color-muted)]">No categories in this area yet.</p>
        ) : (
          categories.map((c) => (
            <Link key={c.id} href={`/forum/${areaSlug}/${c.slug}`}>
              <Card className="h-full border-[var(--color-border)] transition-shadow hover:shadow-md">
                <CardHeader className="text-lg">{c.name}</CardHeader>
                <CardContent className="text-sm text-[var(--color-muted)]">
                  {c.description || "View discussions"}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
