/**
 * Adds admin_only column to forum_threads.
 * Run: node --env-file=.env.local scripts/migrate-admin-only-threads.js
 */
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS admin_only BOOLEAN NOT NULL DEFAULT FALSE`;
  console.log("Done: admin_only column added to forum_threads.");
}

main().catch(console.error);
