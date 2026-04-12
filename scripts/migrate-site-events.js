/**
 * Community events (content + optional external link, same shape as planning_applications).
 * Run: node --env-file=.env.local scripts/migrate-site-events.js
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
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
            val = val.slice(1, -1);
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
  await sql`
    CREATE TABLE IF NOT EXISTS site_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      body TEXT NOT NULL,
      external_url TEXT NOT NULL,
      cover_image_url TEXT,
      author_id UUID REFERENCES users(id) ON DELETE SET NULL,
      published_at TIMESTAMPTZ,
      archived_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_site_events_published ON site_events (published_at DESC) WHERE archived_at IS NULL`;

  await sql`
    INSERT INTO email_templates (template_key, subject, body_html, body_text)
    VALUES (
      ${"event_new"},
      ${"New event: {{title}}"},
      ${'<p>Hi {{name}},</p><p>New event: <strong>{{title}}</strong></p><p><a href="{{link}}">View on our site</a></p>'},
      ${"Hi {{name}},\n\nNew event: {{title}}\n{{link}}"}
    )
    ON CONFLICT (template_key) DO NOTHING
  `;

  console.log("migrate-site-events done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
