/**
 * Upload public code of conduct PDF to Vercel Blob and set site_content.code_of_conduct_pdf_url.
 * Run after: node scripts/generate-code-of-conduct-pdf.js
 *
 * Run: node --env-file=.env.local scripts/upload-code-of-conduct-blob.js
 */
const path = require("path");
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");

const PDF_PATH = path.join(__dirname, "..", "public", "documents", "culcheth-glazebury-ra-code-of-conduct.pdf");

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
    console.error("Run: node scripts/generate-code-of-conduct-pdf.js");
    process.exit(1);
  }

  const body = fs.readFileSync(PDF_PATH);
  const { put } = await import("@vercel/blob");
  const blob = await put("site/culcheth-glazebury-ra-code-of-conduct.pdf", body, {
    access: "public",
    token,
    addRandomSuffix: false,
    contentType: "application/pdf",
  });

  const sql = neon(databaseUrl);
  await sql`
    INSERT INTO site_content (key, value) VALUES ('code_of_conduct_pdf_url', ${blob.url})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
  console.log("Uploaded:", blob.url);
  console.log("site_content.code_of_conduct_pdf_url updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
