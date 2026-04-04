/**
 * Replace solid yellow (and similar) background in the RA logo with white.
 * Source: RA docs/Main logo.jpeg → public/branding/site-logo.jpeg
 * Run: node scripts/process-logo-white-bg.js
 */
const fs = require("fs");
const path = require("path");

async function main() {
  const sharp = (await import("sharp")).default;
  const input = path.join(__dirname, "..", "RA docs", "Main logo.jpeg");
  const outDir = path.join(__dirname, "..", "public", "branding");
  const output = path.join(outDir, "site-logo.jpeg");

  if (!fs.existsSync(input)) {
    console.error("Missing:", input);
    process.exit(1);
  }
  fs.mkdirSync(outDir, { recursive: true });

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const ch = channels;

  // Two-colour logo: bright yellow/cream background + dark line art. Keep only
  // dark pixels (black + anti-alias); everything else → pure white.
  const darkCutoff = 132;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * ch;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);

      if (max >= darkCutoff) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        if (ch === 4) data[i + 3] = 255;
      }
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width, height, channels: ch },
  })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(output);

  console.log("Wrote", output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
