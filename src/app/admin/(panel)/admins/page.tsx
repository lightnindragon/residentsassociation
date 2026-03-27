import { getSql } from "@/lib/db";
import { AddAdminForm } from "./AddAdminForm";
import { AdminRow } from "./AdminRow";

export default async function AdminAdminsPage() {
  type Row = { id: string; name: string; email: string; role: string };
  let admins: Row[] = [];
  try {
    const sql = getSql();
    admins = (await sql`
      SELECT id, name, email, role FROM users
      WHERE role IN ('admin', 'dev')
      ORDER BY name
    `) as Row[];
  } catch {
    // no DB
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Administrators</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Add committee admins. Use a strong password (10+ characters).
      </p>
      <AddAdminForm />
      <ul className="mt-8 space-y-4">
        {admins.map((a) => (
          <AdminRow key={a.id} admin={a} />
        ))}
      </ul>
    </div>
  );
}
