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
          )
            val = val.slice(1, -1);
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Running professional forum migrations...");

  console.log("1. Adding avatar_url to users...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`;

  console.log("2. Creating forum_thread_views...");
  await sql`
    CREATE TABLE IF NOT EXISTS forum_thread_views (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
      last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, thread_id)
    )
  `;

  console.log("3. Creating forum_post_likes...");
  await sql`
    CREATE TABLE IF NOT EXISTS forum_post_likes (
      post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (post_id, user_id)
    )
  `;

  console.log("Migration complete.");
}

main().catch((e) => {
  console.error("Error running migration:", e);
  process.exit(1);
});
