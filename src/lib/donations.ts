import { getSql } from "@/lib/db";

export type DonationSettings = {
  enabled: boolean;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  accountName: string;
};

export async function getDonationSettings(): Promise<DonationSettings | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT enabled, bank_name, sort_code, account_number, account_name
      FROM donation_settings
      LIMIT 1
    `;
    const row = rows[0] as
      | {
          enabled: boolean;
          bank_name: string;
          sort_code: string;
          account_number: string;
          account_name: string;
        }
      | undefined;
    if (!row) return null;
    return {
      enabled: row.enabled,
      bankName: row.bank_name ?? "",
      sortCode: row.sort_code ?? "",
      accountNumber: row.account_number ?? "",
      accountName: row.account_name ?? "",
    };
  } catch {
    return null;
  }
}
