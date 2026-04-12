/**
 * Full plan schema additions. Run: node --env-file=.env.local scripts/migrate-full-plan.js
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

async function q(s) {
  await sql.query(s);
}

async function main() {
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT true`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_new_blog BOOLEAN NOT NULL DEFAULT false`);
  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_notes TEXT`);
  await q(`UPDATE users SET approved = true WHERE role IN ('admin', 'dev')`);
  await q(`UPDATE users SET approved = COALESCE(approved, true)`);

  await q(`
    CREATE TABLE IF NOT EXISTS forum_areas (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await q(`
    CREATE TABLE IF NOT EXISTS post_categories (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0,
      show_in_header BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await q(`ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES forum_areas(id) ON DELETE CASCADE`);
  const areas = await sql`SELECT id FROM forum_areas WHERE slug = 'general' LIMIT 1`;
  let areaId = areas[0]?.id;
  if (!areaId) {
    const ins = await sql`
      INSERT INTO forum_areas (name, slug, sort_order) VALUES ('General', 'general', 0) RETURNING id
    `;
    areaId = ins[0].id;
  }
  if (areaId) {
    await sql`UPDATE forum_categories SET area_id = ${areaId} WHERE area_id IS NULL`;
  }

  await q(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_category_id UUID REFERENCES post_categories(id) ON DELETE SET NULL`);

  await q(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await q(`CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id)`);

  await q(`
    CREATE TABLE IF NOT EXISTS email_templates (
      template_key TEXT PRIMARY KEY,
      subject TEXT NOT NULL DEFAULT '',
      body_html TEXT NOT NULL DEFAULT '',
      body_text TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS forum_follows (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type TEXT NOT NULL CHECK (target_type IN ('area', 'category', 'thread')),
      target_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, target_type, target_id)
    )
  `);
  await q(`CREATE INDEX IF NOT EXISTS idx_forum_follows_user ON forum_follows(user_id)`);

  await q(`ALTER TABLE users ADD COLUMN IF NOT EXISTS forum_emails_enabled BOOLEAN NOT NULL DEFAULT true`);

  await q(`
    CREATE TABLE IF NOT EXISTS media_assets (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      url TEXT NOT NULL,
      label TEXT,
      source TEXT NOT NULL DEFAULT 'upload',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      facebook_url TEXT,
      twitter_url TEXT,
      instagram_url TEXT,
      youtube_url TEXT,
      linkedin_url TEXT
    )
  `);
  await q(`INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`);

  const defaultTemplates = [
    [
      "resident_approved",
      "Your account is approved – Culcheth & Glazebury RA",
      "<p>Hi {{name}},</p><p>Your Residents Association account has been approved. You can now <a href=\"{{loginUrl}}\">sign in</a>.</p><p>— Culcheth & Glazebury Residents Association</p>",
      "Hi {{name}},\n\nYour account has been approved. Sign in: {{loginUrl}}\n\n— CGRA",
    ],
    [
      "message_assigned",
      "You were assigned a message – CGRA",
      "<p>Hi {{name}},</p><p>You have been assigned: <strong>{{subject}}</strong></p><p><a href=\"{{link}}\">Open message</a></p>",
      "Hi {{name}},\n\nAssigned: {{subject}}\n{{link}}",
    ],
    [
      "blog_new_comment",
      "New comment on: {{title}}",
      "<p>New comment on <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View</a></p><p>{{body}}</p>",
      "New comment on {{title}}\n{{link}}\n{{body}}",
    ],
    [
      "blog_new_post",
      "New post: {{title}}",
      "<p>Hi {{name}},</p><p>New article: <strong>{{title}}</strong></p><p><a href=\"{{link}}\">Read more</a></p>",
      "Hi {{name}},\n\nNew: {{title}}\n{{link}}",
    ],
    [
      "planning_new_application",
      "New planning application: {{title}}",
      "<p>Hi {{name}},</p><p>New planning application: <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View on our site</a></p>",
      "Hi {{name}},\n\nNew planning application: {{title}}\n{{link}}",
    ],
    [
      "event_new",
      "New event: {{title}}",
      "<p>Hi {{name}},</p><p>New event: <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View on our site</a></p>",
      "Hi {{name}},\n\nNew event: {{title}}\n{{link}}",
    ],
    [
      "agenda_new",
      "New agenda: {{title}}",
      "<p>Hi {{name}},</p><p>New agenda: <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View on our site</a></p>",
      "Hi {{name}},\n\nNew agenda: {{title}}\n{{link}}",
    ],
    [
      "minutes_new",
      "New minutes: {{title}}",
      "<p>Hi {{name}},</p><p>New meeting minutes: <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View on our site</a></p>",
      "Hi {{name}},\n\nNew minutes: {{title}}\n{{link}}",
    ],
    [
      "message_reply_to_customer",
      "Reply to your enquiry: {{subject}}",
      "<p>Hi {{name}},</p><p>You have a reply to your enquiry.</p><p><strong>Subject:</strong> {{subject}}</p><div style=\"margin:1em 0;padding:1em;background:#f5f5f5;border-radius:6px;\">{{body}}</div><p><a href=\"{{link}}\">View thread and reply</a></p>",
      "Hi {{name}},\n\nReply to: {{subject}}\n\n{{body}}\n\n{{link}}",
    ],
    [
      "forum_new_thread",
      "New forum thread: {{title}}",
      "<p>New thread in <strong>{{category}}</strong>: {{title}}</p><p><a href=\"{{link}}\">Open thread</a></p>",
      "New thread in {{category}}: {{title}}\n{{link}}",
    ],
    [
      "forum_new_reply",
      "New reply in: {{title}}",
      "<p>New reply in <strong>{{title}}</strong></p><p><a href=\"{{link}}\">View thread</a></p><p>{{preview}}</p>",
      "New reply in {{title}}\n{{link}}\n{{preview}}",
    ],
  ];
  for (const [key, subj, html, text] of defaultTemplates) {
    await sql`
      INSERT INTO email_templates (template_key, subject, body_html, body_text)
      VALUES (${key}, ${subj}, ${html}, ${text})
      ON CONFLICT (template_key) DO NOTHING
    `;
  }

  console.log("migrate-full-plan done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
