/**
 * Adds the Parish Plan Questionnaire news post.
 * Run: node --env-file=.env.local scripts/add-parish-news.js
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
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  // Load the provided image
  const imagePath = "C:\\Users\\jorda\\.cursor\\projects\\c-Web-Design-Residents\\assets\\c__Users_jorda_AppData_Roaming_Cursor_User_workspaceStorage_099eea861b539cc994fe0187ff302a9f_images_image-909a7ab8-538f-4fe5-8e43-7631c4b83a4d.png";
  if (!fs.existsSync(imagePath)) {
    console.error("Image file not found at", imagePath);
    process.exit(1);
  }
  const buf = fs.readFileSync(imagePath);

  let imagePublicUrl = "";
  if (token) {
    const { put } = await import("@vercel/blob");
    const stamp = Date.now();
    try {
      const blob = await put(`blog/${stamp}-parish-plan.png`, buf, {
        access: "public",
        token,
        contentType: "image/png",
      });
      imagePublicUrl = blob.url;
      console.log("Uploaded image to Vercel Blob:", imagePublicUrl);
    } catch (e) {
      console.warn("Failed to upload to Vercel Blob, falling back to local storage.", e.message);
    }
  }

  if (!imagePublicUrl) {
    const stamp = Date.now();
    const destDir = path.join(__dirname, "..", "public", "blog");
    fs.mkdirSync(destDir, { recursive: true });
    const fileName = `${stamp}-parish-plan.png`;
    fs.writeFileSync(path.join(destDir, fileName), buf);
    imagePublicUrl = `/blog/${fileName}`;
    console.log("Saved image locally:", imagePublicUrl);
  }

  const sql = neon(databaseUrl);

  const title = "Parish Plan Questionnaire";
  const slug = "parish-plan-questionnaire";
  const excerpt = "One of our Committee recently attended a Parish Plan meeting. As outlined at our meeting on Monday, we are happy to help by sharing this information across our community.";
  
  const body = `
<p>One of our Committee recently attended a Parish Plan meeting. As outlined at our meeting on Monday, we are happy to help by sharing this information across our community.</p>
<p>Please complete the questionnaire by 31 March 2026.</p>
<p>Your feedback will help shape the future of our villages.</p>
<p>We encourage everyone to take a few minutes to respond and share your views. Thank you for your support.</p>
<p><strong><a href="https://docs.google.com/forms/d/1S30Kl1indhD8cxbz2r4Q8gparl5S20sSjzt35eoEwAc/edit" target="_blank" rel="noopener noreferrer">Click here to access the questionnaire</a></strong></p>
<p><em>*INFORMATION ONLY POST*</em></p>
<img src="${imagePublicUrl}" alt="Parish Plan Questionnaire Information" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 1rem;" />
`;

  // First check if a post with this slug exists
  const existing = await sql`SELECT id FROM posts WHERE slug = ${slug}`;
  if (existing.length > 0) {
    await sql`
      UPDATE posts 
      SET body = ${body}, excerpt = ${excerpt}, cover_image_url = ${imagePublicUrl}
      WHERE slug = ${slug}
    `;
    console.log("Updated existing post.");
  } else {
    await sql`
      INSERT INTO posts (title, slug, excerpt, body, cover_image_url, published_at)
      VALUES (${title}, ${slug}, ${excerpt}, ${body}, ${imagePublicUrl}, NOW())
    `;
    console.log("Inserted new post.");
  }

  console.log("Done.");
}

main().catch(console.error);