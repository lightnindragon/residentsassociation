const { neon } = require("@neondatabase/serverless");
const bcrypt = require("bcryptjs");

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  const pwd = await bcrypt.hash("CgraAdmin2024!", 12);
  
  const users = [
    { name: "Gill Stott", email: "gillmstott@gmail.com", role: "admin" },
    { name: "Joy Cooper-Crippin", email: "Joyful2020@hotmail.com", role: "admin" },
    { name: "Marian Kay", email: "mariankay9@aol.com", role: "admin" },
    { name: "Gayle Day", email: "gday1064@hotmail.co.uk", role: "admin" },
    { name: "Gordon Stirling", email: "Whiston1954@gmail.com", role: "admin" }
  ];

  for (const u of users) {
    await sql`
      INSERT INTO users (email, password_hash, name, role, approved)
      VALUES (${u.email}, ${pwd}, ${u.name}, ${u.role}, true)
      ON CONFLICT (email) DO NOTHING
    `;
    console.log(`Added user ${u.name}`);
  }

  const members = [
    { name: "Gill Stott", role: "Chair" },
    { name: "Joy Cooper-Crippin", role: "Secretary" },
    { name: "Marian Kay", role: "Treasurer" },
    { name: "Gayle Day", role: "Community Liaison" },
    { name: "Gordon Stirling", role: "Community Liaison" }
  ];

  let i = 1;
  for (const m of members) {
    await sql`
      INSERT INTO committee_members (name, role, sort_order)
      VALUES (${m.name}, ${m.role}, ${i++})
    `;
    console.log(`Added committee member ${m.name}`);
  }

  console.log("Done");
}

run().catch(console.error);