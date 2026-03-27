/**
 * Upload public constitution PDF to Vercel Blob and set site_content.constitution_pdf_url.
 * Run after: python scripts/strip-constitution-signatures.py
 *
 * Run: node --env-file=.env.local scripts/upload-constitution-blob.js
 */
const path = require("path");
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");

const PDF_PATH = path.join(__dirname, "..", "public", "documents", "culcheth-glazebury-ra-constitution.pdf");

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
  if (!fs.existsSync(PDF_PATH)) {
    console.error("PDF not found:", PDF_PATH);
    console.error("Run: python scripts/strip-constitution-signatures.py");
    process.exit(1);
  }

  const body = fs.readFileSync(PDF_PATH);
  const { put } = await import("@vercel/blob");
  const blob = await put("site/culcheth-glazebury-ra-constitution.pdf", body, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "application/pdf",
  });

  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO site_content (key, value) VALUES ('constitution_pdf_url', ${blob.url})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  console.log("Uploaded:", blob.url);
  console.log("site_content.constitution_pdf_url updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
