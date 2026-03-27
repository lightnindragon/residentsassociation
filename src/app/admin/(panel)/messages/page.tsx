import Link from "next/link";
import { getSql } from "@/lib/db";
import { Badge } from "@/components/ui";
import { AssignForm } from "./AssignForm";
import { StatusForm } from "./StatusForm";
import { MessageFilters } from "./Filters";
import { formatUkDate } from "@/lib/date-format";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : null;
  const assigneeFilter = typeof resolvedParams.assignee === "string" ? resolvedParams.assignee : null;

  let messages: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    body: string;
    status: string;
    created_at: string;
    assigned_to_id: string | null;
    assignee_name: string | null;
  }> = [];
  let admins: Array<{ id: string; name: string; email: string }> = [];
  try {
    const sql = getSql();
    
    // Construct the dynamic query based on filters
    // Using simple conditional push for safe query building
    messages = (await sql`
      SELECT m.id, m.name, m.email, m.subject, m.body, m.status, m.created_at, m.assigned_to_id,
             u.name AS assignee_name
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to_id
      WHERE 
        (${statusFilter}::text IS NULL OR m.status = ${statusFilter})
        AND (
          ${assigneeFilter}::text IS NULL 
          OR (${assigneeFilter} = 'unassigned' AND m.assigned_to_id IS NULL)
          OR (m.assigned_to_id = ${assigneeFilter !== 'unassigned' ? assigneeFilter : null}::uuid)
        )
      ORDER BY m.created_at DESC
      LIMIT 100
    `) as typeof messages;

    admins = (await sql`
      SELECT id, name, email FROM users WHERE role IN ('admin', 'dev') ORDER BY name
    `) as typeof admins;
  } catch (e) {
    // no DB
    console.error(e);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        Contact messages
      </h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Assign messages to admins; they will receive an email notification.
      </p>

      <MessageFilters admins={admins} />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-3 text-left font-medium">From</th>
              <th className="py-3 text-left font-medium">Subject</th>
              <th className="py-3 text-left font-medium">Status</th>
              <th className="py-3 text-left font-medium">Assigned to</th>
              <th className="py-3 text-left font-medium">Date</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[var(--color-muted)]">
                  No messages yet.
                </td>
              </tr>
            ) : (
              messages.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-card)]"
                >
                  <td className="py-3">
                    <div>{m.name}</div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {m.email}
                    </div>
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/messages/${m.id}`}
                      className="font-medium hover:underline"
                    >
                      {m.subject}
                    </Link>
                  </td>
                  <td className="py-3">
                    <StatusForm messageId={m.id} currentStatus={m.status} />
                  </td>
                  <td className="py-3">{m.assignee_name ?? "General"}</td>
                  <td className="py-3 text-[var(--color-muted)]">
                    {formatUkDate(m.created_at)}
                  </td>
                  <td className="py-3 text-right">
                    <AssignForm
                      messageId={m.id}
                      currentAssignedToId={m.assigned_to_id}
                      admins={admins}
                    />
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
