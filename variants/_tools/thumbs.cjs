#!/usr/bin/env node
// Make lightweight JPEG thumbnails of each variant's first screen for the gallery.
// Usage: node variants/_tools/thumbs.cjs   → writes variants/<slug>/_shots/thumb.jpg (720x450)
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => fs.existsSync(p));
const root = path.resolve(__dirname, "..");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "thumbs-"));
  const chrome = spawn(CHROME, ["--headless=new", "--hide-scrollbars", "--no-first-run", "--allow-file-access-from-files", "--remote-debugging-port=0", `--user-data-dir=${prof}`, "about:blank"], { stdio: "ignore" });
  let port;
  for (let i = 0; i < 100 && !port; i++) { await sleep(150); try { port = fs.readFileSync(path.join(prof, "DevToolsActivePort"), "utf8").split("\n")[0].trim(); } catch {} }
  const t = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((x) => x.type === "page");
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const evs = [];
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } else evs.forEach((f) => f(m)); };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const dirs = fs.readdirSync(root).filter((d) => /^\d\d-/.test(d));
  for (const d of dirs) {
    const png = path.join(root, d, "_shots", "index-desktop.png");
    if (!fs.existsSync(png)) { console.log("skip", d); continue; }
    const loaded = new Promise((r) => { const f = (m) => { if (m.method === "Page.loadEventFired") r(); }; evs.push(f); });
    await send("Page.navigate", { url: "file:///" + png.replace(/\\/g, "/") });
    await loaded; await sleep(200);
    // the image is shown at natural size (1440x900) at top-left with body margin; remove margin
    await send("Runtime.evaluate", { expression: "document.body.style.margin=0;document.body.style.background='#000';" });
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 78, clip: { x: 0, y: 0, width: 1440, height: 900, scale: 0.5 } });
    fs.writeFileSync(path.join(root, d, "_shots", "thumb.jpg"), Buffer.from(shot.data, "base64"));
    console.log("thumb", d);
  }
  ws.close(); chrome.kill();
  setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} }, 800);
})();
