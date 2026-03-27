/**
 * One-off: restructure committee bios with \n\n paragraph breaks (matches About page rendering).
 * Run: node --env-file=.env.local scripts/update-committee-bios-paragraphs.js
 */
const { neon } = require("@neondatabase/serverless");

const bios = {
  "Gill Stott": `I'm Gill Stott — married into a family that have been part of the village for almost 80 years, mum to two grown-up children, and I've lived in Culcheth since 2004.

I'm a fan of supporting the brilliant local businesses we're lucky to have in Culcheth and Glazebury. I first came here in the mid-1980s as a teenager with big hair, never imagining I'd one day call it home.

My background is in HR, and those skills now help me support residents with a variety of concerns, including planning applications.

As part of the Residents Association, I want to work for the best interests of Culcheth and Glazebury.`,

  "Joy Cooper-Crippin": `Hi, I'm Joy Cooper Crippin. I moved to Warrington from Manchester in 1982, living in Cinnamon Brow before settling in Culcheth in 2005 — where my husband is proudly born and bred.

I'm a mum of two and a proud grandma to four, and through them I've been lucky to see just how much the village has to offer, with all of them involved in local clubs over the years.

My career has included roles in retail and administration, along with 26 years in local government. More recently, I worked with Miller Metcalfe, where I met so many lovely people — both those who live here and those wanting to move to Culcheth to raise their families.

I've always felt so welcomed here, and I truly love being part of this community. I'd really like to give something back and help others feel just as at home as I did.`,

  "Marian Kay": `Hello, I'm Marian and I'm a retired Civil Servant having worked primarily as a Customs Officer. I'm married to Mike and we have lived in Culcheth since 1994. I'm step-mum to two sons and a very proud grandmother of four who range in age from 24 to 3.

I have a first class honours degree in Social Policy from the Open University and a Counselling diploma, and I volunteer as a bereavement counsellor with St Rocco's. My career as a Civil Servant and work with St Rocco's has taught me a lot about responsibility and the importance of supporting others.

When we moved to Culcheth it had everything we were looking for — great facilities, a friendly feel, and easy access to both Manchester and Liverpool. Over the years, we've made many friends and Culcheth has become more than just a place to live; it's home in every sense of the word.

I'd like the village to maintain those values and I'm confident that the Residents' Association can provide a platform for that.`,

  "Gayle Munroe": `My name is Gay. I was born in Culcheth in 1964 and have been a lifelong resident. I've brought up my four daughters here and now have seven grandchildren, four of whom go to the local schools and nursery.

When I left school I worked at Newchurch Hospital in the annex, then I worked in the CPS centre on and off for more than twenty years, and then at Victoria Wine on Lodge Drive until my grandchildren were born and I looked after them.

I joined the Residents Association because I want Culcheth and Glazebury to remain a community, and to listen to villagers' concerns and try to act on them. You might have seen me out litter picking, which I do as a resident.

I feel so lucky to have lived here all my life and I can't imagine living anywhere else.`,
};

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  for (const [name, bio] of Object.entries(bios)) {
    const result = await sql`
      UPDATE committee_members SET bio = ${bio} WHERE name = ${name}
    `;
    console.log(name, "updated, count:", result.length ?? result);
  }
}

main().catch(console.error);
