/**
 * Default new users to opted-in for news emails (column default).
 * Run: node --env-file=.env.local scripts/migrate-notify-news-default-true.js
 */
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE users ALTER COLUMN notify_new_blog SET DEFAULT true`;
  console.log("Done: users.notify_new_blog default is now true.");
}

main().catch(console.error);
