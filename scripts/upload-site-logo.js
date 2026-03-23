/**
 * Upload RA docs main logo to Vercel Blob (public store required for header use).
 * Run: node --env-file=.env.local scripts/upload-site-logo.js
 * If this fails with "private store", enable public Blob for the project or keep using /branding/site-logo.jpeg.
 */
const path = require("path");
const fs = require("fs");

async function main() {
  const { put } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token?.trim()) {
    console.error("BLOB_READ_WRITE_TOKEN is not set.");
    process.exit(1);
  }
  const filePath = path.join(__dirname, "..", "RA docs", "Main logo.jpeg");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }
  const body = fs.readFileSync(filePath);
  try {
    const blob = await put("site/main-logo.jpeg", body, {
      access: "public",
      token: token.trim(),
      addRandomSuffix: false,
      contentType: "image/jpeg",
    });
    console.log(blob.url);
    console.log(
      "\nOptional: set NEXT_PUBLIC_SITE_LOGO_URL to this URL in Vercel (and .env.local) to use Blob instead of /branding/site-logo.jpeg",
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("private store") || msg.includes("private access")) {
      console.error(msg);
      console.error(
        "\nYour Blob store is private. Use a public Blob store for this token, or rely on public/branding/site-logo.jpeg (already in the repo).",
      );
      process.exit(1);
    }
    throw e;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
