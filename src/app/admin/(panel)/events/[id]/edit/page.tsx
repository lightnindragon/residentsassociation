import Link from "next/link";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EventForm } from "../../EventForm";

export default async function AdminEditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) redirect("/login");

  const { id } = await params;
  type Row = {
    id: string;
    title: string;
    excerpt: string | null;
    body: string;
    external_url: string;
    published_at: string | null;
    cover_image_url: string | null;
    archived_at: string | null;
  };
  let event: Row | null = null;
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, title, excerpt, body, external_url, published_at, cover_image_url, archived_at
      FROM site_events WHERE id = ${id}::uuid LIMIT 1
    `;
    event = (rows[0] as Row) ?? null;
  } catch {
    // no DB
  }
  if (!event) notFound();

  return (
    <div>
      <Link href="/admin/events" className="text-sm text-[var(--color-primary)] hover:underline">
        ← Events
      </Link>
      <h1 className="mt-4 font-heading text-2xl font-semibold">Edit Event</h1>
      {event.archived_at && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
          This event is <strong>archived</strong> and hidden from the public events pages. Unarchive it
          from the{" "}
          <Link href="/admin/events?filter=archived" className="font-medium underline">
            Archived
          </Link>{" "}
          tab on the list.
        </p>
      )}
      <EventForm authorId={user.id} event={event} />
    </div>
  );
}
