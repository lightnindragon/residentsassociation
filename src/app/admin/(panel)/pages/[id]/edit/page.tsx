import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getNavMenu } from "@/lib/nav-menu";
import { PageForm } from "../../PageForm";

function hrefInMenu(items: { href: string; children?: { href: string }[] }[], href: string): boolean {
  return items.some((item) => item.href === href || (item.children && hrefInMenu(item.children, href)));
}

export default async function AdminEditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  const { id } = await params;
  type Row = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    published_at: string | null;
    cover_image_url: string | null;
  };
  let page: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, slug, excerpt, body, published_at, cover_image_url
      FROM site_pages WHERE id = ${id}::uuid LIMIT 1
    `;
    page = (rows[0] as Row) ?? null;
  } catch {
    // no DB
  }
  if (!page) notFound();

  const [desktop, mobile] = await Promise.all([getNavMenu("desktop"), getNavMenu("mobile")]);
  const href = `/${page.slug}`;

  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Pages
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Edit Page</h1>
      <PageForm
        authorId={user.id}
        page={page}
        alreadyInDesktop={hrefInMenu(desktop, href)}
        alreadyInMobile={hrefInMenu(mobile, href)}
      />
    </div>
  );
}
