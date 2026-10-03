/**
 * Allow Events, Planning, Agendas, and Minutes to be saved without an external URL.
 * Run: node --env-file=.env.local scripts/migrate-optional-external-urls.js
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
  await sql.query(`ALTER TABLE planning_applications ALTER COLUMN external_url DROP NOT NULL`);
  await sql.query(`ALTER TABLE site_events ALTER COLUMN external_url DROP NOT NULL`);
  await sql.query(`ALTER TABLE site_agendas ALTER COLUMN external_url DROP NOT NULL`);
  await sql.query(`ALTER TABLE site_minutes ALTER COLUMN external_url DROP NOT NULL`);
  console.log("external_url is now optional on planning, events, agendas, and minutes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
