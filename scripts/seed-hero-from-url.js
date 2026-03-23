/**
 * Download an image, upload to Vercel Blob under blog/ (same as blog editor uploads),
 * insert into gallery_images, optional media_assets, and set homepage hero (site_content.home_hero_image_url).
 *
 * Run: node --env-file=.env.local scripts/seed-hero-from-url.js
 * Or:  node --env-file=.env.local scripts/seed-hero-from-url.js "https://..."
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

const DEFAULT_URL =
  "https://www.greatbritishlife.co.uk/resources/images/16781363.jpg?type=mds-article-962";

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
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const databaseUrl = process.env.DATABASE_URL;
  if (!token) {
    console.error("BLOB_READ_WRITE_TOKEN is not set.");
    process.exit(1);
  }
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const imageUrl = (process.argv[2] || DEFAULT_URL).trim();
  const res = await fetch(imageUrl, {
    headers: {
      "User-Agent": "ResidentsAssociationSite/1.0 (hero seed)",
      Accept: "image/*",
    },
  });
  if (!res.ok) {
    console.error("Failed to fetch image:", res.status, res.statusText);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) {
    console.error("Downloaded file too small; aborting.");
    process.exit(1);
  }

  const { put } = await import("@vercel/blob");
  const contentType =
    res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";

  let imagePublicUrl;
  try {
    const blob = await put(`blog/${Date.now()}-culcheth-hero.jpg`, buf, {
      access: "public",
      token,
      contentType,
    });
    imagePublicUrl = blob.url;
    console.error("Uploaded to Vercel Blob (public).");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("private store") || msg.includes("private access")) {
      const outPath = path.join(__dirname, "..", "public", "home-hero.jpg");
      fs.writeFileSync(outPath, buf);
      imagePublicUrl = "/home-hero.jpg";
      console.error(
        "Blob store is private — saved to public/home-hero.jpg. Enable a public Blob store on Vercel to use Blob URLs instead.",
      );
    } else {
      throw e;
    }
  }

  const caption =
    "Culcheth area — image originally published by Great British Life (greatbritishlife.co.uk)";
  const sql = neon(databaseUrl);

  await sql`
    INSERT INTO gallery_images (url, caption)
    VALUES (${imagePublicUrl}, ${caption})
  `;
  try {
    await sql`
      INSERT INTO media_assets (url, label, source)
      VALUES (${imagePublicUrl}, ${caption}, 'blog')
    `;
  } catch {
    // media_assets may not exist
  }
  await sql`
    INSERT INTO site_content (key, value) VALUES ('home_hero_image_url', ${imagePublicUrl})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;

  console.log(imagePublicUrl);
  console.log("\nDone: gallery row + home_hero_image_url set. Redeploy or visit / to refresh ISR cache.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
