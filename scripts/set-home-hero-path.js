/**
 * Point homepage hero at a path under /public (no Blob).
 * Prefer: node --env-file=.env.local scripts/upload-home-hero-blob.js
 * Run: node --env-file=.env.local scripts/set-home-hero-path.js
 */
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`
    INSERT INTO site_content (key, value) VALUES ('home_hero_image_url', '/Newchurch_front_right_2.jpg')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  console.log("home_hero_image_url → /Newchurch_front_right_2.jpg");
}

main().catch(console.error);
