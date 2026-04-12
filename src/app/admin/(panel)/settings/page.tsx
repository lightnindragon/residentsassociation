import { getSql } from "@/lib/db";
import { AdminSettingsForm } from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  let config: {
    host: string;
    port: number;
    user: string;
    from_address: string;
    contact_inbox: string;
  } | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT host, port, "user", from_address, contact_inbox
      FROM smtp_config
      LIMIT 1
    `;
    const row = rows[0];
    if (row && (row as { host: string }).host) {
      config = row as typeof config & { host: string };
    }
  } catch {
    // no DB or no config
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Email / SMTP Settings
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Configure SMTP so contact form messages are sent to your Proton Mail
        inbox. Leave password blank to keep the current one.
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Grey hint text in the fields is not saved — enter your real SMTP host,
        user, Proton SMTP token (password), from address, and inbox email, then
        Save.
      </p>
      <AdminSettingsForm initial={config} />
    </div>
  );
}
