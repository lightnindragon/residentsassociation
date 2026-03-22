/**
 * Add site_content and committee_members for editable About and Contact.
 * Run: node --env-file=.env.local scripts/migrate-about-contact.js
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
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);
  await sql.query(`
    CREATE TABLE IF NOT EXISTS committee_members (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_committee_members_sort ON committee_members(sort_order ASC)`);

  const defaults = [
    ["about_intro", "The Culcheth & Glazebury Residents Association represents and supports residents in the Culcheth and Glazebury areas. We work to promote community interests, share local news and events, and provide a forum for discussion.\n\nThis website is your hub for the latest news, a residents' forum, gallery, and a way to get in touch with the committee. If you'd like to get involved or have questions, please use the Contact page."],
    ["contact_title", "Contact us"],
    ["contact_description", "Send a message to the residents association. We'll get back to you as soon as we can."],
    ["contact_label_name", "Your name"],
    ["contact_label_email", "Email"],
    ["contact_label_subject", "Subject"],
    ["contact_label_message", "Message"],
    ["contact_label_submit", "Send message"],
  ];
  for (const [k, v] of defaults) {
    await sql`INSERT INTO site_content (key, value) VALUES (${k}, ${v}) ON CONFLICT (key) DO NOTHING`;
  }
  console.log("site_content and committee_members ready; default content seeded.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
