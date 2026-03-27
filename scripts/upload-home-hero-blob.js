/**
 * Upload the homepage hero JPEG to Vercel Blob (public) and set site_content.home_hero_image_url.
 *
 * Requires: BLOB_READ_WRITE_TOKEN, DATABASE_URL (e.g. in .env.local)
 * Run: node --env-file=.env.local scripts/upload-home-hero-blob.js
 * Optional: node ... scripts/upload-home-hero-blob.js "C:\\path\\to\\photo.jpg"
 */
const path = require("path");
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");

const DEFAULT_REL = path.join(__dirname, "..", "public", "Newchurch_front_right_2.jpg");

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is not set.");
    process.exit(1);
  }
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const argPath = process.argv[2]?.trim();
  const filePath = argPath
    ? path.resolve(argPath)
    : DEFAULT_REL;
  if (!fs.existsSync(filePath)) {
    console.error("Image not found:", filePath);
    console.error("Add the file or pass a path: node scripts/upload-home-hero-blob.js <path-to.jpg>");
    process.exit(1);
  }

  const body = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase() || ".jpg";
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  const { put } = await import("@vercel/blob");
  let imagePublicUrl;
  try {
    const blob = await put(`site/home-hero${ext}`, body, {
      access: "public",
      token,
      addRandomSuffix: false,
      contentType,
    });
    imagePublicUrl = blob.url;
    console.error("Uploaded to Vercel Blob:", imagePublicUrl);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("private store") || msg.includes("private access")) {
      console.error(msg);
      console.error("\nUse a public Blob store for this token (Vercel → Storage → Blob).");
      process.exit(1);
    }
    throw e;
  }

  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO site_content (key, value) VALUES ('home_hero_image_url', ${imagePublicUrl})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  console.log("site_content.home_hero_image_url updated.");
  console.log("\nRedeploy if needed; homepage reads this URL from the database.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
