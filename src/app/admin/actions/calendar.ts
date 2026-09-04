"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string; id?: string } | undefined;
  if (user?.role !== "admin" && user?.role !== "dev") throw new Error("Admin only");
  return user;
}

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
};

function parseOptionalDate(value: string | undefined): string | null {
  const t = value?.trim();
  if (!t) return null;
  const local = /^\d{4}-\d{2}-\d{2}$/.test(t) ? `${t}T00:00:00` : t;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseRequiredDate(value: string | undefined): string | null {
  return parseOptionalDate(value);
}

export async function createCalendarEvent(
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    const user = await requireAdmin();
    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim() || null;
    const location = formData.get("location")?.toString()?.trim() || null;
    const allDay = formData.get("all_day") === "1";
    const startsAt = parseRequiredDate(formData.get("starts_at")?.toString());
    const endsAt = parseOptionalDate(formData.get("ends_at")?.toString());

    if (!title) return { error: "Title is required." };
    if (!startsAt) return { error: "Start date is required." };
    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      return { error: "End must be after the start." };
    }

    const sql = getSql();
    await sql`
      INSERT INTO admin_calendar_events (
        title, description, starts_at, ends_at, all_day, location, created_by
      )
      VALUES (
        ${title}, ${description}, ${startsAt}, ${endsAt}, ${allDay}, ${location},
        ${user.id ?? null}::uuid
      )
    `;
    revalidatePath("/admin/calendar");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to save calendar event." };
  }
}

export async function updateCalendarEvent(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim() || null;
    const location = formData.get("location")?.toString()?.trim() || null;
    const allDay = formData.get("all_day") === "1";
    const startsAt = parseRequiredDate(formData.get("starts_at")?.toString());
    const endsAt = parseOptionalDate(formData.get("ends_at")?.toString());

    if (!title) return { error: "Title is required." };
    if (!startsAt) return { error: "Start date is required." };
    if (endsAt && new Date(endsAt) < new Date(startsAt)) {
      return { error: "End must be after the start." };
    }

    const sql = getSql();
    await sql`
      UPDATE admin_calendar_events
      SET title = ${title},
          description = ${description},
          starts_at = ${startsAt},
          ends_at = ${endsAt},
          all_day = ${allDay},
          location = ${location},
          updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    revalidatePath("/admin/calendar");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update calendar event." };
  }
}

export async function deleteCalendarEvent(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    await sql`DELETE FROM admin_calendar_events WHERE id = ${id}::uuid`;
    revalidatePath("/admin/calendar");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to delete event." };
  }
}