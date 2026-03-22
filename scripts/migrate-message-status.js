/**
 * One-off: migrate contact_messages status to unresponded/open/replied/closed
 * and create contact_message_replies. Run: node --env-file=.env.local scripts/migrate-message-status.js
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

  // Map old status to new
  await sql.query(`UPDATE contact_messages SET status = 'unresponded' WHERE status = 'new'`);
  await sql.query(`UPDATE contact_messages SET status = 'open' WHERE status = 'in_progress'`);
  await sql.query(`UPDATE contact_messages SET status = 'closed' WHERE status = 'done'`);

  try {
    await sql.query(`ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check`);
  } catch (_) {}
  await sql.query(
    `ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('unresponded', 'open', 'replied', 'closed'))`
  );

  await sql.query(`
    CREATE TABLE IF NOT EXISTS contact_message_replies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      contact_message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
      from_side TEXT NOT NULL CHECK (from_side IN ('resident', 'admin')),
      body TEXT NOT NULL,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_contact_message_replies_message ON contact_message_replies(contact_message_id)
  `);

  console.log("Message status migration and contact_message_replies table done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
