/**
 * Add forum_username and forum_town to users for forum profile.
 * Run: node --env-file=.env.local scripts/migrate-forum-profile.js
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
  try {
    await sql.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_username TEXT`);
    await sql.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_town TEXT`);
    console.log("Forum profile columns added.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
