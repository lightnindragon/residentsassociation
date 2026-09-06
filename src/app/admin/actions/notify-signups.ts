"use server";

import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  notifySubscribersNewAgenda,
  notifySubscribersNewEvent,
  notifySubscribersNewMinutes,
  notifySubscribersNewPlanningApplication,
  notifySubscribersNewPost,
} from "@/lib/notify-blog";
import type { SignUpNotifyKind } from "@/lib/publish-notify";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin" && user?.role !== "dev") throw new Error("Admin only");
}

type ContentRow = {
  title: string;
  slug: string;
  published_at: string | null;
  subscribers_notified_at: string | null;
};

export async function sendToSignUps(
  kind: SignUpNotifyKind,
  id: string
): Promise<{ ok: boolean; error?: string; sent?: number }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Forbidden." };
  }

  try {
    const sql = getSql();
    let row: ContentRow | undefined;
    if (kind === "news") {
      const [r] = await sql`
        SELECT title, slug, published_at, subscribers_notified_at
        FROM posts WHERE id = ${id}::uuid LIMIT 1
      `;
      row = r as ContentRow | undefined;
    } else if (kind === "planning") {
      const [r] = await sql`
        SELECT title, slug, published_at, subscribers_notified_at
        FROM planning_applications WHERE id = ${id}::uuid LIMIT 1
      `;
      row = r as ContentRow | undefined;
    } else if (kind === "event") {
      const [r] = await sql`
        SELECT title, slug, published_at, subscribers_notified_at
        FROM site_events WHERE id = ${id}::uuid LIMIT 1
      `;
      row = r as ContentRow | undefined;
    } else if (kind === "agenda") {
      const [r] = await sql`
        SELECT title, slug, published_at, subscribers_notified_at
        FROM site_agendas WHERE id = ${id}::uuid LIMIT 1
      `;
      row = r as ContentRow | undefined;
    } else {
      const [r] = await sql`
        SELECT title, slug, published_at, subscribers_notified_at
        FROM site_minutes WHERE id = ${id}::uuid LIMIT 1
      `;
      row = r as ContentRow | undefined;
    }

    if (!row) return { ok: false, error: "Item not found." };
    if (!row.published_at) {
      return { ok: false, error: "Publish this item before sending it to sign-ups." };
    }
    if (row.subscribers_notified_at) {
      return { ok: false, error: "Sign-ups have already been emailed about this." };
    }

    const params = { title: row.title, slug: row.slug };
    const result =
      kind === "news"
        ? await notifySubscribersNewPost(params)
        : kind === "planning"
          ? await notifySubscribersNewPlanningApplication(params)
          : kind === "event"
            ? await notifySubscribersNewEvent(params)
            : kind === "agenda"
              ? await notifySubscribersNewAgenda(params)
              : await notifySubscribersNewMinutes(params);

    if (result.sent > 0 || !result.error) {
      if (kind === "news") {
        await sql`UPDATE posts SET subscribers_notified_at = NOW() WHERE id = ${id}::uuid`;
        revalidatePath("/admin/news");
        revalidatePath(`/admin/news/${id}/edit`);
      } else if (kind === "planning") {
        await sql`UPDATE planning_applications SET subscribers_notified_at = NOW() WHERE id = ${id}::uuid`;
        revalidatePath("/admin/planning-applications");
        revalidatePath(`/admin/planning-applications/${id}/edit`);
      } else if (kind === "event") {
        await sql`UPDATE site_events SET subscribers_notified_at = NOW() WHERE id = ${id}::uuid`;
        revalidatePath("/admin/events");
        revalidatePath(`/admin/events/${id}/edit`);
      } else if (kind === "agenda") {
        await sql`UPDATE site_agendas SET subscribers_notified_at = NOW() WHERE id = ${id}::uuid`;
        revalidatePath("/admin/agendas");
        revalidatePath(`/admin/agendas/${id}/edit`);
      } else {
        await sql`UPDATE site_minutes SET subscribers_notified_at = NOW() WHERE id = ${id}::uuid`;
        revalidatePath("/admin/minutes");
        revalidatePath(`/admin/minutes/${id}/edit`);
      }
    }

    if (result.error) return { ok: false, error: result.error, sent: result.sent };
    return { ok: true, sent: result.sent };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to send emails." };
  }
}