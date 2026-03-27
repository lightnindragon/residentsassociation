import Link from "next/link";
import { getSql } from "@/lib/db";
import { formatUkDate } from "@/lib/date-format";

type Filter = "in" | "out";

export default async function AdminNewsUpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter: Filter = raw === "out" ? "out" : "in";

  let users: Array<{
    id: string;
    name: string;
    email: string;
    approved: boolean;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    if (filter === "in") {
      users = (await sql`
        SELECT id, name, email, approved, created_at
        FROM users
        WHERE role = 'user' AND notify_new_blog = true
        ORDER BY name ASC NULLS LAST, email ASC
        LIMIT 500
      `) as typeof users;
    } else {
      users = (await sql`
        SELECT id, name, email, approved, created_at
        FROM users
        WHERE role = 'user' AND notify_new_blog = false
        ORDER BY name ASC NULLS LAST, email ASC
        LIMIT 500
      `) as typeof users;
    }
  } catch {
    // no DB
  }

  const tab = (label: string, value: Filter) => {
    const active = filter === value;
    return (
      <Link
        href={value === "in" ? "/admin/news-updates" : "/admin/news-updates?filter=out"}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          active
            ? "bg-[var(--color-primary)] text-white"
            : "border border-[var(--color-border)] text-[var(--foreground)] hover:bg-[var(--color-border)]/30"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        News &amp; updates email preferences
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Residents who have opted in or out of &quot;Receive news and updates by email&quot; (new blog posts).
        Only accounts with role <strong>user</strong> are listed; approved members are who receive sends.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab("Opted in", "in")}
        {tab("Opted out", "out")}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">Name</th>
              <th className="py-3 text-left font-medium">Email</th>
              <th className="py-3 text-left font-medium">Approved</th>
              <th className="py-3 text-left font-medium">Joined</th>
              <th className="py-3 text-right font-medium">Resident</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-muted)]">
                  No residents in this list.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 font-medium text-[var(--foreground)]">{u.name}</td>
                  <td className="py-3 text-[var(--color-muted)]">{u.email}</td>
                  <td className="py-3">{u.approved ? "Yes" : "No"}</td>
                  <td className="py-3 text-[var(--color-muted)]">{formatUkDate(u.created_at)}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/residents/${u.id}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      View
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
