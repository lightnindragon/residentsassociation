/**
 * One-off script to create an admin user. Run from project root:
 *   node --env-file=.env.local scripts/create-admin.js
 * Or set DATABASE_URL in the environment.
 */
const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env.local if DATABASE_URL not set
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
  console.error("DATABASE_URL is not set. Use .env.local or set the variable.");
  process.exit(1);
}

const email = "enquiries@webdesigns-uk.com";
const password = "Al3xEr1c!";
const name = "Webdesigns Admin";

function runSchemaStatements(sqlContent) {
  const lines = sqlContent.split("\n").filter((line) => !line.trim().startsWith("--"));
  const body = lines.join("\n");
  const statements = body
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return statements.map((s) => (s.endsWith(";") ? s : s + ";"));
}

async function runSchema(sql) {
  const schemaPath = path.join(__dirname, "schema.sql");
  const content = fs.readFileSync(schemaPath, "utf8");
  const statements = runSchemaStatements(content);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log("Schema applied.");
}

async function main() {
  const sql = neon(DATABASE_URL);

  try {
    await sql.query("SELECT 1 FROM users LIMIT 1");
  } catch (e) {
    if (e.code === "42P01" || (e.message && e.message.includes("does not exist"))) {
      console.log("Schema not found. Applying schema...");
      await runSchema(sql);
    } else {
      throw e;
    }
  }

  const password_hash = await bcrypt.hash(password, 12);
  const emailLower = email.trim().toLowerCase();

  try {
    await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${emailLower}, ${password_hash}, ${name}, 'dev')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role = 'dev',
        updated_at = NOW()
    `;
    console.log("Dev user created/updated: " + email + " (role: dev)");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
