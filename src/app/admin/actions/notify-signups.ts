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

type ClaimedRow = { title: string; slug: string };

async function claimSend(kind: SignUpNotifyKind, id: string): Promise<
  { status: "claimed"; row: ClaimedRow } | { status: "already" } | { status: "unpublished" } | { status: "missing" }
> {
  const sql = getSql();
  let claimed: ClaimedRow | undefined;
  if (kind === "news") {
    const [r] = await sql`
      UPDATE posts
      SET subscribers_notified_at = NOW()
      WHERE id = ${id}::uuid AND published_at IS NOT NULL AND subscribers_notified_at IS NULL
      RETURNING title, slug
    `;
    claimed = r as ClaimedRow | undefined;
  } else if (kind === "planning") {
    const [r] = await sql`
      UPDATE planning_applications
      SET subscribers_notified_at = NOW()
      WHERE id = ${id}::uuid AND published_at IS NOT NULL AND subscribers_notified_at IS NULL
      RETURNING title, slug
    `;
    claimed = r as ClaimedRow | undefined;
  } else if (kind === "event") {
    const [r] = await sql`
      UPDATE site_events
      SET subscribers_notified_at = NOW()
      WHERE id = ${id}::uuid AND published_at IS NOT NULL AND subscribers_notified_at IS NULL
      RETURNING title, slug
    `;
    claimed = r as ClaimedRow | undefined;
  } else if (kind === "agenda") {
    const [r] = await sql`
      UPDATE site_agendas
      SET subscribers_notified_at = NOW()
      WHERE id = ${id}::uuid AND published_at IS NOT NULL AND subscribers_notified_at IS NULL
      RETURNING title, slug
    `;
    claimed = r as ClaimedRow | undefined;
  } else {
    const [r] = await sql`
      UPDATE site_minutes
      SET subscribers_notified_at = NOW()
      WHERE id = ${id}::uuid AND published_at IS NOT NULL AND subscribers_notified_at IS NULL
      RETURNING title, slug
    `;
    claimed = r as ClaimedRow | undefined;
  }

  if (claimed) return { status: "claimed", row: claimed };

  let existing:
    | { published_at: string | null; subscribers_notified_at: string | null }
    | undefined;
  if (kind === "news") {
    const [r] = await sql`SELECT published_at, subscribers_notified_at FROM posts WHERE id = ${id}::uuid LIMIT 1`;
    existing = r as typeof existing;
  } else if (kind === "planning") {
    const [r] = await sql`SELECT published_at, subscribers_notified_at FROM planning_applications WHERE id = ${id}::uuid LIMIT 1`;
    existing = r as typeof existing;
  } else if (kind === "event") {
    const [r] = await sql`SELECT published_at, subscribers_notified_at FROM site_events WHERE id = ${id}::uuid LIMIT 1`;
    existing = r as typeof existing;
  } else if (kind === "agenda") {
    const [r] = await sql`SELECT published_at, subscribers_notified_at FROM site_agendas WHERE id = ${id}::uuid LIMIT 1`;
    existing = r as typeof existing;
  } else {
    const [r] = await sql`SELECT published_at, subscribers_notified_at FROM site_minutes WHERE id = ${id}::uuid LIMIT 1`;
    existing = r as typeof existing;
  }

  if (!existing) return { status: "missing" };
  if (!existing.published_at) return { status: "unpublished" };
  return { status: "already" };
}

function revalidateKind(kind: SignUpNotifyKind, id: string) {
  if (kind === "news") {
    revalidatePath("/admin/news");
    revalidatePath(`/admin/news/${id}/edit`);
  } else if (kind === "planning") {
    revalidatePath("/admin/planning-applications");
    revalidatePath(`/admin/planning-applications/${id}/edit`);
  } else if (kind === "event") {
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${id}/edit`);
  } else if (kind === "agenda") {
    revalidatePath("/admin/agendas");
    revalidatePath(`/admin/agendas/${id}/edit`);
  } else {
    revalidatePath("/admin/minutes");
    revalidatePath(`/admin/minutes/${id}/edit`);
  }
}

export async function sendToSignUps(
  kind: SignUpNotifyKind,
  id: string
): Promise<{ ok: boolean; error?: string; sent?: number; alreadySent?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Forbidden." };
  }

  try {
    const claimed = await claimSend(kind, id);
    if (claimed.status === "missing") return { ok: false, error: "Item not found." };
    if (claimed.status === "unpublished") {
      return { ok: false, error: "Publish this item before sending it to sign-ups." };
    }
    if (claimed.status === "already") {
      return { ok: true, alreadySent: true };
    }

    const params = { title: claimed.row.title, slug: claimed.row.slug };
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

    revalidateKind(kind, id);

    if (result.error) return { ok: false, error: result.error, sent: result.sent, alreadySent: true };
    return { ok: true, sent: result.sent, alreadySent: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to send emails." };
  }
}
