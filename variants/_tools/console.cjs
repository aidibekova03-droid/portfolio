#!/usr/bin/env node
// Print browser console output (incl. uncaught errors) for a variant page.
// Usage: node variants/_tools/console.cjs <variant-folder> [page=index.html]
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].find((p) => fs.existsSync(p));
const dir = path.resolve(process.argv[2] || ".");
const page = process.argv[3] || "index.html";
const url = "file:///" + path.join(dir, page).replace(/\\/g, "/");
const prof = fs.mkdtempSync(path.join(os.tmpdir(), "console-"));
const r = spawnSync(
  CHROME,
  ["--headless=new", "--enable-logging=stderr", "--v=0", "--allow-file-access-from-files",
   "--window-size=1440,900", "--virtual-time-budget=6000", `--user-data-dir=${prof}`, "--dump-dom", url],
  { encoding: "utf8", timeout: 90000 }
);
try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
const lines = (r.stderr || "").split(/\r?\n/).filter((l) => /CONSOLE|Uncaught|Failed to load|net::ERR/i.test(l));
console.log(lines.length ? lines.join("\n") : "No console output or errors.");
console.log(`DOM length: ${(r.stdout || "").length}`);
