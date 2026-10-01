import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { adminDenied } from "@/lib/admin-access";

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const denied = await adminDenied("mailing-list");
  if (denied) {
    return NextResponse.json({ error: denied }, { status: 403 });
  }

  const sql = getSql();
  const rows = (await sql`
    SELECT name, email, source, notes, created_at::text
    FROM mailing_list_subscribers
    ORDER BY name ASC NULLS LAST, email ASC
  `) as Array<{
    name: string;
    email: string;
    source: string;
    notes: string | null;
    created_at: string;
  }>;

  const header = ["Name", "Email", "Source", "Notes", "Added"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.name, r.email, r.source, r.notes ?? "", r.created_at.slice(0, 10)]
        .map((c) => csvCell(c))
        .join(",")
    ),
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mailing-list.csv"',
    },
  });
}