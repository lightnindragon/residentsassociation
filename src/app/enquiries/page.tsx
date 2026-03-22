import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

export default async function EnquiriesPage() {
  const session = await auth();
  const userEmail = (session?.user as { email?: string })?.email;
  if (!userEmail) redirect("/login?callbackUrl=/enquiries");

  let messages: Array<{
    id: string;
    subject: string;
    status: string;
    created_at: string;
  }> = [];
  try {
    const sql = getSql();
    messages = (await sql`
      SELECT id, subject, status, created_at
      FROM contact_messages
      WHERE LOWER(email) = LOWER(${userEmail})
      ORDER BY created_at DESC
      LIMIT 50
    `) as typeof messages;
  } catch {
    // DB not configured
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">
        My enquiries
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        View and continue your contact form conversations. Reply here or by email to reopen a closed enquiry.
      </p>
      <ul className="mt-6 space-y-2">
        {messages.length === 0 ? (
          <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center text-sm text-[var(--color-muted)]">
            You have no enquiries yet. Use the <Link href="/contact" className="text-[var(--color-primary)] hover:underline">Contact</Link> page to get in touch.
          </li>
        ) : (
          messages.map((m) => (
            <li key={m.id}>
              <Link
                href={`/enquiries/${m.id}`}
                className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition hover:border-[var(--color-primary)]/40"
              >
                <span className="font-medium text-[var(--foreground)]">{m.subject}</span>
                <span className="ml-2 rounded bg-[var(--color-muted)]/20 px-1.5 py-0.5 text-xs text-[var(--color-muted)]">
                  {m.status}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
