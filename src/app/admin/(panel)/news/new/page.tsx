import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsPostForm } from "../NewsPostForm";

export default async function AdminNewPostPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  let categories: Array<{ id: string; name: string; slug: string }> = [];
  try {
    const sql = getSql();
    categories = (await sql`
      SELECT id, name, slug FROM post_categories ORDER BY sort_order, name
    `) as typeof categories;
  } catch {
    // no DB
  }

  return (
    <div>
      <Link
        href="/admin/news"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← News
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">New Post</h1>
      <NewsPostForm authorId={user.id} categories={categories} />
    </div>
  );
}
