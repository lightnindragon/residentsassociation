/**
 * Build public/documents/culcheth-glazebury-ra-code-of-conduct.pdf from canonical wording
 * (aligned with RA docs / former About page text).
 *
 * Run: node scripts/generate-code-of-conduct-pdf.js
 */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const OUT = path.join(__dirname, "..", "public", "documents", "culcheth-glazebury-ra-code-of-conduct.pdf");

const SECTIONS = [
  {
    title: "1. Act in the Best Interests of the Community",
    bullets: [
      "Represent all residents fairly and respectfully.",
      "Prioritise projects that improve communication, tidiness, and local connections.",
    ],
  },
  {
    title: "2. Communicate Clearly and Responsively",
    bullets: [
      "Share updates promptly and accurately.",
      "Listen actively to feedback from residents and fellow committee members.",
      "Use respectful, inclusive language in all communications.",
    ],
  },
  {
    title: "3. Collaborate and Support Each Other",
    bullets: [
      "Work constructively with fellow committee members, sub-groups, and volunteers.",
      "Respect differing views and seek consensus where possible.",
      "Support partnerships with local businesses and organisations.",
    ],
  },
  {
    title: "4. Be Transparent and Accountable",
    bullets: [
      "Keep accurate records of meetings, decisions, and finances.",
      "Declare any conflicts of interest and avoid personal gain.",
      "Follow agreed procedures for decision-making and voting.",
    ],
  },
  {
    title: "5. Uphold Integrity and Respect",
    bullets: [
      "Treat all residents with dignity, regardless of background or belief.",
      "Maintain confidentiality where appropriate.",
      "Challenge discrimination or inappropriate behaviour if it arises.",
    ],
  },
  {
    title: "6. Commit to Active Participation",
    bullets: [
      "Attend meetings regularly and contribute to the work of the Association.",
      "Take responsibility for assigned tasks and follow through.",
      "Step aside if unable to fulfil duties consistently.",
    ],
  },
];

const MARGIN = 50;
const TEXT_WIDTH = 595 - MARGIN * 2;

function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const stream = fs.createWriteStream(OUT);
  doc.pipe(stream);

  doc.font("Helvetica-Bold").fontSize(16).text("Code of Conduct for Committee Members", {
    align: "center",
    width: TEXT_WIDTH,
  });
  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(11).text("Culcheth & Glazebury Residents Association", {
    align: "center",
    width: TEXT_WIDTH,
  });
  doc.moveDown(1.2);

  for (const section of SECTIONS) {
    if (doc.y > 780) {
      doc.addPage();
    }
    doc.font("Helvetica-Bold").fontSize(11).text(section.title, { width: TEXT_WIDTH });
    doc.moveDown(0.35);
    for (const line of section.bullets) {
      if (doc.y > 800) {
        doc.addPage();
      }
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`• ${line}`, { width: TEXT_WIDTH - 18, indent: 14 });
      doc.moveDown(0.2);
    }
    doc.moveDown(0.5);
  }

  doc.end();
  stream.on("finish", () => {
    console.log("Wrote", OUT);
  });
}

main();
