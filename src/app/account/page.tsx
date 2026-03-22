import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { AccountSettingsForm } from "./AccountSettingsForm";

export default async function AccountPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/login?callbackUrl=/account");

  type Row = {
    forum_username: string | null;
    forum_town: string | null;
    notify_new_blog: boolean;
    forum_emails_enabled: boolean;
    role: string;
  };
  let row: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT forum_username, forum_town, notify_new_blog, forum_emails_enabled, role
      FROM users WHERE id = ${userId}::uuid LIMIT 1
    `;
    row = (rows[0] as Row) ?? null;
  } catch {
    // no DB
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold">Your account</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Forum display details and email preferences. Admins use the admin panel for most settings.
      </p>
      {row && (
        <AccountSettingsForm
          initial={row}
          isResident={row.role === "user"}
        />
      )}
    </div>
  );
}
