import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { EnquiryReplyForm } from "./EnquiryReplyForm";

export default async function EnquiryThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userEmail = (session?.user as { email?: string })?.email;
  if (!userEmail) redirect(`/login?callbackUrl=/enquiries/${id}`);

  type MessageRow = {
    id: string;
    name: string;
    email: string;
    subject: string;
    body: string;
    status: string;
    created_at: string;
  };
  type ReplyRow = { id: string; from_side: string; body: string; created_at: string };
  let message: MessageRow | null = null;
  let replies: ReplyRow[] = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, email, subject, body, status, created_at
      FROM contact_messages
      WHERE id = ${id}::uuid LIMIT 1
    `;
    message = (rows[0] as MessageRow) ?? null;
    if (message && message.email.toLowerCase() !== userEmail.toLowerCase()) {
      message = null;
    }
    if (message) {
      replies = (await sql`
        SELECT id, from_side, body, created_at
        FROM contact_message_replies
        WHERE contact_message_id = ${id}::uuid
        ORDER BY created_at ASC
      `) as ReplyRow[];
    }
  } catch {
    // DB error
  }

  if (!message) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/enquiries"
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        ← My enquiries
      </Link>
      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--foreground)]">
          {message.subject}
        </h1>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {new Date(message.created_at).toLocaleString()} · Status: {message.status}
        </p>
        <div className="mt-4 whitespace-pre-wrap text-[var(--foreground)]">
          {message.body}
        </div>
        {replies.length > 0 && (
          <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <h2 className="font-heading text-sm font-semibold text-[var(--foreground)]">
              Conversation
            </h2>
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
                    {r.from_side === "admin" ? "Reply from RA" : "Your reply"} ·{" "}
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                  <div className="mt-1 whitespace-pre-wrap">{r.body}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <EnquiryReplyForm messageId={message.id} />
        </div>
      </div>
    </div>
  );
}
