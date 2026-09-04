import { getSql } from "@/lib/db";
import { AdminCalendar } from "./AdminCalendar";
import type { CalendarEvent } from "@/app/admin/actions/calendar";

export default async function AdminCalendarPage() {
  let events: CalendarEvent[] = [];
  try {
    const sql = getSql();
    events = (await sql`
      SELECT id, title, description, starts_at::text, ends_at::text, all_day, location
      FROM admin_calendar_events
      ORDER BY starts_at ASC
    `) as CalendarEvent[];
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--foreground)]">Calendar</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Internal committee calendar — only visible to admins. Use it for meetings, deadlines, and
        reminders that should not appear on the public site.
      </p>
      <AdminCalendar events={events} />
    </div>
  );
}