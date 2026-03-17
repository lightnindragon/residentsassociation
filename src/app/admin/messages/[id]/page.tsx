import Link from "next/link";
import { getSql } from "@/lib/db";
import { Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import { AssignForm } from "../AssignForm";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  type MessageRow = {
    id: string;
    name: string;
    email: string;
    subject: string;
    body: string;
    status: string;
    created_at: string;
    assigned_to_id: string | null;
    assignee_name: string | null;
  };
  let message: MessageRow | null = null;
  let admins: Array<{ id: string; name: string; email: string }> = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT m.id, m.name, m.email, m.subject, m.body, m.status, m.created_at, m.assigned_to_id,
             u.name AS assignee_name
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to_id
      WHERE m.id = ${id}::uuid
      LIMIT 1
    `;
    message = (rows[0] as MessageRow) ?? null;
    admins = (await sql`
      SELECT id, name, email FROM users WHERE role = 'admin' ORDER BY name
    `) as typeof admins;
  } catch {
    // no DB
  }
  if (!message) notFound();

  return (
    <div>
      <Link
        href="/admin/messages"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← Back to messages
      </Link>
      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-semibold">{message.subject}</h1>
          <Badge
            variant={
              message.status === "done"
                ? "success"
                : message.status === "in_progress"
                  ? "warning"
                  : "muted"
            }
          >
            {message.status}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          From {message.name} &lt;{message.email}&gt; ·{" "}
          {new Date(message.created_at).toLocaleString()}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Assigned to: {message.assignee_name ?? "—"}
        </p>
        <div className="mt-4">
          <AssignForm
            messageId={message.id}
            currentAssignedToId={message.assigned_to_id}
            admins={admins}
          />
        </div>
        <div className="mt-6 whitespace-pre-wrap border-t border-[var(--color-border)] pt-4 text-[var(--foreground)]">
          {message.body}
        </div>
      </div>
    </div>
  );
}
