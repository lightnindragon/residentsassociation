const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT, ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ`;
  console.log("added reset token cols");
}

main();