import Link from "next/link";
import { getSql } from "@/lib/db";
import { notFound } from "next/navigation";
import { ResidentEditForm } from "./ResidentEditForm";

export default async function EditResidentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  type Row = {
    id: string;
    name: string;
    email: string;
    forum_username: string | null;
    forum_town: string | null;
    admin_notes: string | null;
    approved: boolean;
    banned: boolean;
    role: string;
  };
  let user: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, forum_username, forum_town, admin_notes, approved, banned, role
      FROM users WHERE id = ${id}::uuid AND role = 'user' LIMIT 1
    `;
    user = (rows[0] as Row) ?? null;
  } catch {
    // no DB
  }
  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/residents" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Residents
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Edit resident</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {user.email} · {user.approved ? "Approved" : "Pending"}
        {user.banned ? " · Banned" : ""}
      </p>
      <ResidentEditForm user={user} />
    </div>
  );
}
