/**
 * Track whether sign-up emails have been sent for published content.
 * Run: node --env-file=.env.local scripts/migrate-subscribers-notified.js
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
  await sql.query(
    `ALTER TABLE posts ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMPTZ`
  );
  await sql.query(
    `ALTER TABLE planning_applications ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMPTZ`
  );
  await sql.query(
    `ALTER TABLE site_events ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMPTZ`
  );
  await sql.query(
    `ALTER TABLE site_agendas ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMPTZ`
  );
  await sql.query(
    `ALTER TABLE site_minutes ADD COLUMN IF NOT EXISTS subscribers_notified_at TIMESTAMPTZ`
  );
  console.log("subscribers_notified_at ready on posts, planning, events, agendas, minutes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
