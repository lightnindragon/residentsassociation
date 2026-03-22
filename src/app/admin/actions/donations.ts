"use server";

import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveDonationSettings(data: {
  enabled: boolean;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  accountName: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT id FROM donation_settings LIMIT 1`;
    const id = (rows[0] as { id: string } | undefined)?.id;
    if (id) {
      await sql`
        UPDATE donation_settings SET
          enabled = ${data.enabled},
          bank_name = ${data.bankName.trim()},
          sort_code = ${data.sortCode.trim()},
          account_number = ${data.accountNumber.trim()},
          account_name = ${data.accountName.trim()},
          updated_at = NOW()
        WHERE id = ${id}::uuid
      `;
    } else {
      await sql`
        INSERT INTO donation_settings (enabled, bank_name, sort_code, account_number, account_name)
        VALUES (
          ${data.enabled},
          ${data.bankName.trim()},
          ${data.sortCode.trim()},
          ${data.accountNumber.trim()},
          ${data.accountName.trim()}
        )
      `;
    }
    revalidatePath("/", "layout");
    revalidatePath("/news");
    revalidatePath("/admin/donations");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Failed to save." };
  }
}
