/**
 * Adds archived_at to posts for hiding old news from the public site.
 * Run: node --env-file=.env.local scripts/migrate-posts-archived.js
 */
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ`;
  console.log("Done: posts.archived_at column ready.");
}

main().catch(console.error);
