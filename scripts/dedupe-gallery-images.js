/**
 * Remove duplicate gallery_images rows that share the same caption, keeping the newest
 * (by uploaded_at, then id). Fixes broken hotlink rows left after re-running seed scripts
 * that uploaded the same photo to Blob or /public/gallery/.
 *
 * Run: node --env-file=.env.local scripts/dedupe-gallery-images.js
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

  const before = await sql`SELECT COUNT(*)::int AS c FROM gallery_images`;
  const nBefore = before[0]?.c ?? 0;

  // One row per non-empty caption (newest wins). Rows with null/blank caption are never deduped.
  await sql`
    DELETE FROM gallery_images gi
    WHERE gi.id IN (
      SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY COALESCE(NULLIF(TRIM(caption), ''), id::text)
                 ORDER BY uploaded_at DESC, id DESC
               ) AS rn
        FROM gallery_images
      ) sub
      WHERE sub.rn > 1
    )
  `;

  const after = await sql`SELECT COUNT(*)::int AS c FROM gallery_images`;
  const nAfter = after[0]?.c ?? 0;

  console.log(`Gallery images: ${nBefore} → ${nAfter} (removed ${nBefore - nAfter} duplicate(s) by caption).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
