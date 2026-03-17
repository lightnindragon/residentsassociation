import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewsPostForm } from "../NewsPostForm";

export default async function AdminNewPostPage() {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  let admins: Array<{ id: string; name: string }> = [];
  try {
    const sql = getSql();
    admins = (await sql`
      SELECT id, name FROM users WHERE role = 'admin' ORDER BY name
    `) as typeof admins;
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
      <h1 className="mt-4 font-heading text-2xl font-semibold">New post</h1>
      <NewsPostForm authorId={user.id} admins={admins} />
    </div>
  );
}
