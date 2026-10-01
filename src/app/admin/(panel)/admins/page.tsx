import { getSql } from "@/lib/db";
import { AddAdminForm } from "./AddAdminForm";
import { AdminRow } from "./AdminRow";
import { getAdminAccess } from "@/lib/admin-access";

export default async function AdminAdminsPage() {
  const access = await getAdminAccess();
  const canAssignDev = access?.role === "dev";
  type Row = {
    id: string;
    name: string;
    email: string;
    role: string;
    admin_permissions: string[] | null;
  };
  let admins: Row[] = [];
  try {
    const sql = getSql();
    admins = (await sql`
      SELECT id, name, email, role, admin_permissions FROM users
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
        Add committee admins and choose which parts of the admin panel each person can use.
      </p>
      <AddAdminForm canAssignDev={canAssignDev} />
      <ul className="mt-8 space-y-4">
        {admins.map((a) => (
          <AdminRow key={a.id} admin={a} canAssignDev={canAssignDev} />
        ))}
      </ul>
    </div>
  );
}
