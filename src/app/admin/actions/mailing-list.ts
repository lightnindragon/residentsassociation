"use server";

import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin" && user?.role !== "dev") throw new Error("Admin only");
}

function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export async function addMailingListSubscriber(
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const name = formData.get("name")?.toString()?.trim() || "";
    const email = normalizeEmail(formData.get("email")?.toString() ?? "");
    const notes = formData.get("notes")?.toString()?.trim() || null;
    if (!email) return { error: "A valid email is required." };

    const sql = getSql();
    await sql`
      INSERT INTO mailing_list_subscribers (name, email, source, notes)
      VALUES (${name}, ${email}, 'manual', ${notes})
    `;
    revalidatePath("/admin/mailing-list");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("idx_mailing_list_email_lower") || msg.toLowerCase().includes("unique")) {
      return { error: "That email is already on the mailing list." };
    }
    console.error(e);
    return { error: "Failed to add subscriber." };
  }
}

export async function updateMailingListSubscriber(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string } | null> {
  try {
    await requireAdmin();
    const name = formData.get("name")?.toString()?.trim() || "";
    const email = normalizeEmail(formData.get("email")?.toString() ?? "");
    const notes = formData.get("notes")?.toString()?.trim() || null;
    if (!email) return { error: "A valid email is required." };

    const sql = getSql();
    await sql`
      UPDATE mailing_list_subscribers
      SET name = ${name}, email = ${email}, notes = ${notes}, updated_at = NOW()
      WHERE id = ${id}::uuid
    `;
    revalidatePath("/admin/mailing-list");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("idx_mailing_list_email_lower") || msg.toLowerCase().includes("unique")) {
      return { error: "That email is already on the mailing list." };
    }
    console.error(e);
    return { error: "Failed to update subscriber." };
  }
}

export async function deleteMailingListSubscriber(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireAdmin();
    const sql = getSql();
    await sql`DELETE FROM mailing_list_subscribers WHERE id = ${id}::uuid`;
    revalidatePath("/admin/mailing-list");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to remove subscriber." };
  }
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export async function importMailingListCsv(
  _prev: unknown,
  formData: FormData
): Promise<{ ok?: boolean; error?: string; added?: number; skipped?: number } | null> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Choose a CSV file to import." };
    }
    if (file.size > 2_000_000) return { error: "CSV file is too large (2 MB max)." };

    const rows = parseCsvRows(await file.text());
    if (rows.length === 0) return { error: "The CSV file is empty." };

    const header = rows[0].map((h) => h.trim().toLowerCase());
    const looksLikeHeader =
      header.includes("email") || header.includes("e-mail") || header.includes("name");
    const dataRows = looksLikeHeader ? rows.slice(1) : rows;
    const emailIdx = header.findIndex((h) => h === "email" || h === "e-mail");
    const nameIdx = header.findIndex((h) => h === "name" || h === "full name");
    const notesIdx = header.findIndex((h) => h === "notes" || h === "note");

    const sql = getSql();
    let added = 0;
    let skipped = 0;

    for (const r of dataRows) {
      const emailRaw =
        emailIdx >= 0 ? r[emailIdx] ?? "" : r.find((c) => c.includes("@")) ?? "";
      const email = normalizeEmail(emailRaw);
      if (!email) {
        skipped += 1;
        continue;
      }
      const name = (nameIdx >= 0 ? r[nameIdx] : r[0] !== emailRaw ? r[0] : "")?.trim() || "";
      const notes = (notesIdx >= 0 ? r[notesIdx] : "")?.trim() || null;
      try {
        await sql`
          INSERT INTO mailing_list_subscribers (name, email, source, notes)
          VALUES (${name}, ${email}, 'import', ${notes})
        `;
        added += 1;
      } catch {
        skipped += 1;
      }
    }

    revalidatePath("/admin/mailing-list");
    return { ok: true, added, skipped };
  } catch (e) {
    console.error(e);
    return { error: "Failed to import CSV." };
  }
}

export async function addWebsiteUsersToMailingList(): Promise<{
  ok: boolean;
  error?: string;
  added?: number;
}> {
  try {
    await requireAdmin();
    const sql = getSql();
    const result = await sql`
      INSERT INTO mailing_list_subscribers (name, email, source)
      SELECT u.name, LOWER(u.email), 'website'
      FROM users u
      WHERE u.role = 'user'
        AND u.approved = true
        AND NOT EXISTS (
          SELECT 1 FROM mailing_list_subscribers m
          WHERE LOWER(m.email) = LOWER(u.email)
        )
      RETURNING id
    `;
    revalidatePath("/admin/mailing-list");
    return { ok: true, added: result.length };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to add website users." };
  }
}