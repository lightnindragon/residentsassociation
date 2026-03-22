const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

const email = process.argv[2] || "jordan1longbottom@gmail.com";
const password = process.argv[3] || "Al3xEr1c!";
const name = process.argv[4] || "Jordan Longbottom";
const role = process.argv[5] || "user";

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const hash = await bcrypt.hash(password, 12);
  await sql.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       name = EXCLUDED.name,
       role = $4,
       updated_at = NOW()`,
    [email.toLowerCase(), hash, name, role]
  );
  console.log(`User created/updated: ${email} (role: ${role})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
