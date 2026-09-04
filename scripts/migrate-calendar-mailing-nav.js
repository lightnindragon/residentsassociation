/**
 * Admin calendar, mailing list, and editable header menus.
 * Run: node --env-file=.env.local scripts/migrate-calendar-mailing-nav.js
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const envPath = path.join(__dirname, "..", ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) {
          const key = m[1].trim();
          let val = m[2].trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS admin_calendar_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      starts_at TIMESTAMPTZ NOT NULL,
      ends_at TIMESTAMPTZ,
      all_day BOOLEAN NOT NULL DEFAULT false,
      location TEXT,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await sql.query(
    `CREATE INDEX IF NOT EXISTS idx_admin_calendar_starts ON admin_calendar_events (starts_at)`
  );

  await sql.query(`
    CREATE TABLE IF NOT EXISTS mailing_list_subscribers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'website')),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await sql.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_mailing_list_email_lower ON mailing_list_subscribers (LOWER(email))`
  );

  await sql.query(`
    CREATE TABLE IF NOT EXISTS nav_menus (
      menu_key TEXT PRIMARY KEY CHECK (menu_key IN ('desktop', 'mobile')),
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log("Calendar, mailing list, and nav menus tables ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
