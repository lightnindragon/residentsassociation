/**
 * One-off migration: allow 'dev' role and set enquiries@webdesigns-uk.com to dev.
 * Run from project root: node --env-file=.env.local scripts/migrate-add-dev-role.js
 */
const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

async function main() {
  const sql = neon(DATABASE_URL);

  // Drop existing check and add new one that includes 'dev'
  try {
    await sql.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
    await sql.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'dev'))`);
    console.log("Constraint updated: role can be user, admin, or dev.");
  } catch (e) {
    console.error("Constraint update failed:", e.message);
    process.exit(1);
  }

  const email = "enquiries@webdesigns-uk.com";
  await sql`UPDATE users SET role = 'dev', updated_at = NOW() WHERE email = ${email}`;
  console.log(email, "set to role 'dev'.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
