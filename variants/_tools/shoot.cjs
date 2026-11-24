#!/usr/bin/env node
// Screenshot a variant page with local headless Chrome via the DevTools protocol.
// Usage: node variants/_tools/shoot.cjs <variant-folder> [page=index.html]
// Writes <variant-folder>/_shots/:
//   {page}-desktop.png       1440x900 first screen
//   {page}-desktop-full.png  1440 wide, full page (scrolled through first so reveals fire)
//   {page}-mobile-full.png   true 390 wide mobile emulation, full page
// Also prints console errors / uncaught exceptions seen while loading.
// Env: WAIT_MS (default 4000) settle time after load; MAX_H (default 14000) cap on full height.
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) throw new Error("Chrome not found");

const dir = path.resolve(process.argv[2] || ".");
const page = process.argv[3] || "index.html";
const [pagePath, query = ""] = page.split("?");
const file = path.join(dir, pagePath);
if (!fs.existsSync(file)) throw new Error("Missing " + file);
const url = "file:///" + file.replace(/\\/g, "/") + (query ? "?" + query : "");
const outDir = path.join(dir, "_shots");
fs.mkdirSync(outDir, { recursive: true });
const base = (process.env.OUT_NAME || pagePath.replace(/\.html$/, ""));
const WAIT = +(process.env.WAIT_MS || 4000);
const MAX_H = +(process.env.MAX_H || 14000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "shoot-"));
  const chrome = spawn(CHROME, [
    "--headless=new", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check",
    "--allow-file-access-from-files", "--remote-debugging-port=0", `--user-data-dir=${prof}`,
    "--window-size=1440,900", "about:blank",
  ], { stdio: "ignore" });
  const kill = () => { try { chrome.kill(); } catch {} setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} }, 800); };
  const hard = setTimeout(() => { console.error("timeout"); kill(); process.exit(1); }, 180000);

  let port;
  for (let i = 0; i < 100 && !port; i++) {
    await sleep(150);
    try { port = fs.readFileSync(path.join(prof, "DevToolsActivePort"), "utf8").split("\n")[0].trim(); } catch {}
  }
  if (!port) throw new Error("Chrome did not start");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pageTarget = targets.find((t) => t.type === "page");
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  const listeners = [];
  const errors = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); return; }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      errors.add("Uncaught: " + ((d.exception && d.exception.description) || d.text).split("\n")[0]);
    }
    if (msg.method === "Runtime.consoleAPICalled" && (msg.params.type === "error" || msg.params.type === "warning")) {
      errors.add(`console.${msg.params.type}: ` + msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") errors.add("log: " + msg.params.entry.text + (msg.params.entry.url ? " " + msg.params.entry.url : ""));
    listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const waitEvent = (name, ms) => new Promise((res) => { const t = setTimeout(res, ms); listeners.push((m) => { if (m.method === name) { clearTimeout(t); res(); } }); });
  const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result.value;

  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");

  const shots = [
    { name: "desktop", w: 1440, h: 900, mobile: false, full: false },
    { name: "desktop-full", w: 1440, h: 900, mobile: false, full: true },
    { name: "mobile-full", w: 390, h: 844, mobile: true, full: true },
  ];
  for (const s of shots) {
    await send("Emulation.setDeviceMetricsOverride", { width: s.w, height: s.h, deviceScaleFactor: 1, mobile: s.mobile });
    await send("Emulation.setTouchEmulationEnabled", { enabled: s.mobile });
    const loaded = waitEvent("Page.loadEventFired", 30000);
    await send("Page.navigate", { url });
    await loaded;
    await sleep(WAIT);
    let height = s.h;
    if (s.full) {
      // Scroll through the page so scroll-triggered reveals fire, then return to top.
      height = await evaluate(`(async () => {
        const H = () => Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
        const go = (y) => { try { window.lenis && window.lenis.scrollTo(y, { immediate: true }); } catch (e) {} window.scrollTo({ top: y, behavior: "instant" }); };
        document.documentElement.style.scrollBehavior = "auto";
        for (let y = 0; y < H(); y += Math.round(innerHeight * 0.6)) { go(y); await new Promise(r => setTimeout(r, 120)); }
        go(H()); await new Promise(r => setTimeout(r, 600));
        go(0); await new Promise(r => setTimeout(r, 400)); go(0);
        // wait until scroll position is really back at the top (smooth-scroll libraries may lag)
        for (let i = 0; i < 30 && scrollY > 0; i++) { go(0); await new Promise(r => setTimeout(r, 100)); }
        await new Promise(r => setTimeout(r, 900));
        return H();
      })()`);
      height = Math.min(height || s.h, MAX_H);
      const overflow = await evaluate(`document.documentElement.scrollWidth - innerWidth`);
      if (overflow > 1) console.log(`WARNING ${s.name}: horizontal overflow of ${overflow}px`);
    }
    const shot = await send("Page.captureScreenshot", {
      format: "png", captureBeyondViewport: s.full, fromSurface: true,
      clip: { x: 0, y: 0, width: s.w, height, scale: 1 },
    });
    const out = path.join(outDir, `${base}-${s.name}.png`);
    fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
    console.log("wrote", out, `(${s.w}x${height})`);
  }
  console.log(errors.size ? "CONSOLE ISSUES:\n" + [...errors].join("\n") : "No console errors.");
  clearTimeout(hard);
  ws.close();
  kill();
}
main().catch((e) => { console.error("failed:", e.message); process.exit(1); });
