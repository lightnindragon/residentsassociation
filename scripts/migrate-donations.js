/**
 * Add donation_settings table. Run: node --env-file=.env.local scripts/migrate-donations.js
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

async function main() {
  const sql = neon(DATABASE_URL);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS donation_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      bank_name TEXT NOT NULL DEFAULT '',
      sort_code TEXT NOT NULL DEFAULT '',
      account_number TEXT NOT NULL DEFAULT '',
      account_name TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const rows = await sql`SELECT id FROM donation_settings LIMIT 1`;
  if (rows.length === 0) {
    await sql`INSERT INTO donation_settings DEFAULT VALUES`;
  }
  console.log("donation_settings ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
