/**
 * Download an image, upload to Vercel Blob under blog/, insert gallery_images (+ media_assets if present).
 * Does not change the homepage hero.
 *
 * Run: node --env-file=.env.local scripts/seed-gallery-from-url.js "https://..."
 * Optional 2nd arg: filename slug (letters/digits/hyphen), e.g. cps-rally
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

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname).replace(/\.[^.]+$/, "") || "image";
    return base.replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "image";
  } catch {
    return "image";
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

  const imageUrl = (process.argv[2] || "").trim();
  if (!imageUrl) {
    console.error(
      'Usage: node scripts/seed-gallery-from-url.js "https://example.com/photo.jpg" [filename-slug]',
    );
    process.exit(1);
  }

  const slugArg = (process.argv[3] || "").trim();
  const slug = slugArg && /^[a-zA-Z0-9-]+$/.test(slugArg) ? slugArg : slugFromUrl(imageUrl);

  const res = await fetch(imageUrl, {
    headers: {
      "User-Agent": "ResidentsAssociationSite/1.0 (gallery seed)",
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
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const stamp = Date.now();

  let imagePublicUrl;
  try {
    const blob = await put(`blog/${stamp}-${slug}.${ext}`, buf, {
      access: "public",
      token,
      contentType,
    });
    imagePublicUrl = blob.url;
    console.error("Uploaded to Vercel Blob (public).");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("private store") || msg.includes("private access")) {
      const galleryDir = path.join(__dirname, "..", "public", "gallery");
      fs.mkdirSync(galleryDir, { recursive: true });
      const fileName = `${stamp}-${slug}.${ext}`;
      const outPath = path.join(galleryDir, fileName);
      fs.writeFileSync(outPath, buf);
      imagePublicUrl = `/gallery/${fileName}`;
      console.error(
        "Blob store is private — saved to public/gallery/. Enable a public Blob store on Vercel to use Blob URLs instead.",
      );
    } else {
      throw e;
    }
  }

  const caption =
    "Community / rally — image from Warrington Worldwide (warrington-worldwide.co.uk)";

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

  console.log(imagePublicUrl);
  console.log("\nDone: gallery row added. Commit public/gallery/* if using static fallback.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
