#!/usr/bin/env node
// Build the deployable site from site/ into deploy/sabrina-portfolio/.
// The site is static: this copies the public files, skips review material
// (NOTES.md, _shots/), and writes a robots.txt that keeps the preview unindexed
// while content is still placeholder.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "site");
const out = path.join(root, "deploy", "sabrina-portfolio");
const SKIP = new Set(["NOTES.md", "_shots"]);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copy(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(b, { recursive: true }); copy(a, b); }
    else fs.copyFileSync(a, b);
  }
}
copy(src, out);
fs.writeFileSync(path.join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");

for (const required of ["index.html", "cv.html", "assets/pfp.jpg"]) {
  if (!fs.existsSync(path.join(out, required))) {
    console.error("Build failed: missing " + required);
    process.exit(1);
  }
}
console.log("Built site/ into deploy/sabrina-portfolio");
