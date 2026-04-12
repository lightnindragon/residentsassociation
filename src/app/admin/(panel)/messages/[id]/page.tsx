import Link from "next/link";
import { getSql } from "@/lib/db";
import { Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import { AssignForm } from "../AssignForm";
import { StatusForm } from "../StatusForm";
import { ReplyForm } from "../ReplyForm";
import { formatUkDateTime } from "@/lib/date-format";

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
    assignee_role: string | null;
  };
  type ReplyRow = { id: string; from_side: string; body: string; created_at: string; author_name: string | null };
  let message: MessageRow | null = null;
  let admins: Array<{ id: string; name: string; email: string }> = [];
  let replies: ReplyRow[] = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT m.id, m.name, m.email, m.subject, m.body, m.status, m.created_at, m.assigned_to_id,
             u.name AS assignee_name, u.role AS assignee_role
      FROM contact_messages m
      LEFT JOIN users u ON u.id = m.assigned_to_id
      WHERE m.id = ${id}::uuid
      LIMIT 1
    `;
    message = (rows[0] as MessageRow) ?? null;
    admins = (await sql`
      SELECT id, name, email FROM users WHERE role IN ('admin', 'dev') ORDER BY name
    `) as typeof admins;
    replies = (await sql`
      SELECT r.id, r.from_side, r.body, r.created_at, u.name AS author_name
      FROM contact_message_replies r
      LEFT JOIN users u ON u.id = r.author_id
      WHERE r.contact_message_id = ${id}::uuid
      ORDER BY r.created_at ASC
    `) as ReplyRow[];
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
        ← Back To Messages
      </Link>
      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-semibold">{message.subject}</h1>
          <div className="flex items-center gap-2">
            <StatusForm messageId={message.id} currentStatus={message.status} />
            <Badge
              variant={
                message.status === "closed"
                  ? "success"
                  : message.status === "replied"
                    ? "default"
                    : message.status === "open"
                      ? "warning"
                      : "muted"
              }
            >
              {message.status}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          From {message.name} &lt;{message.email}&gt; ·{" "}
          {formatUkDateTime(message.created_at)}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Assigned to:{" "}
          {message.assigned_to_id
            ? message.assignee_role === "admin" || message.assignee_role === "dev"
              ? "Admin"
              : (message.assignee_name ?? "—")
            : "General"}
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
        {replies.length > 0 && (
          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <h2 className="font-heading text-sm font-semibold text-[var(--foreground)]">Replies</h2>
            <ul className="mt-2 space-y-3">
              {replies.map((r) => (
                <li
                  key={r.id}
                  className={`rounded-lg border p-3 text-sm ${
                    r.from_side === "admin"
                      ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] bg-[var(--color-card)]"
                  }`}
                >
                  <p className="text-xs text-[var(--color-muted)]">
                    {r.from_side === "admin" ? "Admin" : "Resident"} ·{" "}
                    {formatUkDateTime(r.created_at)}
                  </p>
                  <div className="mt-1 whitespace-pre-wrap">{r.body}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <ReplyForm messageId={message.id} />
        </div>
      </div>
    </div>
  );
}
