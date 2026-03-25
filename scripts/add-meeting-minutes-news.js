/**
 * News post: meeting minutes published (Google Doc link + cover image).
 * Run: node --env-file=.env.local scripts/add-meeting-minutes-news.js
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

/** Public view link (works for shared Google Docs without Facebook redirect noise). */
const MINUTES_DOC_URL =
  "https://docs.google.com/document/d/1sbXZHBfIxxPB4oTqIJowvG4UR_QXEGct/view?usp=sharing";

/** Royalty-free cover (Unsplash — downloaded once into /public/blog for next/image). */
const COVER_IMAGE_SRC =
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1600&q=85&auto=format&fit=crop";

async function main() {
  loadEnv();
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const res = await fetch(COVER_IMAGE_SRC);
  if (!res.ok) {
    console.error("Failed to download cover image:", res.status);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());

  let imagePublicUrl = "";
  if (token) {
    const { put } = await import("@vercel/blob");
    const stamp = Date.now();
    try {
      const blob = await put(`blog/${stamp}-meeting-minutes.jpg`, buf, {
        access: "public",
        token,
        contentType: "image/jpeg",
      });
      imagePublicUrl = blob.url;
      console.log("Uploaded cover to Vercel Blob:", imagePublicUrl);
    } catch (e) {
      console.warn("Blob upload failed, using public/blog.", e.message);
    }
  }

  if (!imagePublicUrl) {
    const stamp = Date.now();
    const destDir = path.join(__dirname, "..", "public", "blog");
    fs.mkdirSync(destDir, { recursive: true });
    const fileName = `${stamp}-meeting-minutes.jpg`;
    fs.writeFileSync(path.join(destDir, fileName), buf);
    imagePublicUrl = `/blog/${fileName}`;
    console.log("Saved cover locally:", imagePublicUrl);
  }

  const sql = neon(databaseUrl);

  const title = "Meeting minutes published";
  const slug = "meeting-minutes-published";
  const excerpt =
    "The latest committee meeting minutes are available to read online. Open the shared document using the link below.";

  const body = `
<p>We have published the minutes from our recent committee meeting.</p>
<p>You can <strong><a href="${MINUTES_DOC_URL}">read the minutes here on Google Docs</a></strong> (opens in a new tab).</p>
<p>If you have trouble opening the link, copy and paste this address into your browser:</p>
<p><code style="word-break: break-all;">${MINUTES_DOC_URL}</code></p>
<img src="${imagePublicUrl}" alt="Meeting minutes announcement" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem;" />
`;

  const existing = await sql`SELECT id FROM posts WHERE slug = ${slug}`;
  if (existing.length > 0) {
    await sql`
      UPDATE posts
      SET title = ${title},
          excerpt = ${excerpt},
          body = ${body},
          cover_image_url = ${imagePublicUrl},
          published_at = NOW(),
          updated_at = NOW()
      WHERE slug = ${slug}
    `;
    console.log("Updated existing post:", slug);
  } else {
    await sql`
      INSERT INTO posts (title, slug, excerpt, body, cover_image_url, published_at)
      VALUES (${title}, ${slug}, ${excerpt}, ${body}, ${imagePublicUrl}, NOW())
    `;
    console.log("Inserted new post:", slug);
  }

  console.log("Done.");
}

main().catch(console.error);
