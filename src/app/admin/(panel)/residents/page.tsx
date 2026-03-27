import Link from "next/link";
import { getSql } from "@/lib/db";
import { ApproveResidentButton } from "./ApproveResidentButton";

export default async function AdminResidentsPage() {
  type Row = {
    id: string;
    name: string;
    email: string;
    forum_username: string | null;
    forum_town: string | null;
    approved: boolean;
    created_at: string;
  };
  let users: Row[] = [];
  try {
    const sql = getSql();
    users = (await sql`
      SELECT id, name, email, forum_username, forum_town, approved, created_at
      FROM users WHERE role = 'user'
      ORDER BY approved ASC, created_at DESC
    `) as Row[];
  } catch {
    // no DB
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Residents</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Approve sign-ups, edit forum names, and add admin notes.
          </p>
        </div>
        <Link
          href="/admin/residents/new"
          className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          Add resident
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Email</th>
              <th className="py-2 text-left">Forum name</th>
              <th className="py-2 text-left">Town</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-muted)]">
                  No residents yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2 font-medium">{u.name}</td>
                  <td className="py-2 text-[var(--color-muted)]">{u.email}</td>
                  <td className="py-2">{u.forum_username ?? "—"}</td>
                  <td className="py-2">{u.forum_town ?? "—"}</td>
                  <td className="py-2">
                    {u.approved ? (
                      <span className="text-[var(--color-primary)]">Approved</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">Pending</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {!u.approved && <ApproveResidentButton userId={u.id} />}
                    <Link
                      href={`/admin/residents/${u.id}`}
                      className="ml-2 text-[var(--color-primary)] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
