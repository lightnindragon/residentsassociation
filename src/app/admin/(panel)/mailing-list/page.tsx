import { getSql } from "@/lib/db";
import { MailingListManager } from "./MailingListManager";

export type MailingListRow = {
  id: string;
  name: string;
  email: string;
  source: string;
  notes: string | null;
  created_at: string;
};

export default async function AdminMailingListPage() {
  let subscribers: MailingListRow[] = [];
  try {
    const sql = getSql();
    subscribers = (await sql`
      SELECT id, name, email, source, notes, created_at::text
      FROM mailing_list_subscribers
      ORDER BY name ASC NULLS LAST, email ASC
    `) as MailingListRow[];
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Mailing list
      </h1>
      <p className="mt-1 max-w-2xl text-[var(--color-muted)]">
        A contact list separate from website accounts. Import and export a spreadsheet, add people
        by hand, or copy approved residents across. This list is for committee communication — it
        does not change who receives automatic article emails.
      </p>
      <MailingListManager subscribers={subscribers} />
    </div>
  );
}