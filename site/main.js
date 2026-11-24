/* Pixel Neko Quest — interactions, canvas scenes and the desktop cat.
   Plain script (no modules) so the page works straight from file://. */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  var RM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var SPR = window.SPR || { S: {}, PAL: {} };
  var S = SPR.S, PAL = SPR.PAL;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[neko] " + name + " skipped:", e && e.message); } }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + 0.5) / 16; });
  function bayer(x, y) { return BAYER[(y & 3) * 4 + (x & 3)]; }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  /* ---------------------------------------------------------
     Sprites
     --------------------------------------------------------- */
  var urlCache = {};
  function drawSprite(ctx, rows, ox, oy, scale, opts) {
    opts = opts || {};
    var pal = opts.pal || PAL;
    var w = rows[0].length;
    for (var y = 0; y < rows.length; y++) {
      var r = rows[y];
      for (var x = 0; x < w; x++) {
        var ch = r.charAt(x);
        if (ch === ".") continue;
        ctx.fillStyle = pal[ch] || PAL[ch];
        var dx = opts.flip ? (w - 1 - x) : x;
        ctx.fillRect(ox + dx * scale, oy + y * scale, scale, scale);
      }
    }
  }
  function spriteURL(name) {
    if (urlCache[name]) return urlCache[name];
    var rows = S[name];
    if (!rows) return "";
    var c = doc.createElement("canvas");
    c.width = rows[0].length; c.height = rows.length;
    drawSprite(c.getContext("2d"), rows, 0, 0, 1);
    return (urlCache[name] = c.toDataURL());
  }
  function stripURL(names) {
    var key = names.join("+");
    if (urlCache[key]) return urlCache[key];
    var w = S[names[0]][0].length, h = S[names[0]].length;
    var c = doc.createElement("canvas");
    c.width = w * names.length; c.height = h;
    var x = c.getContext("2d");
    names.forEach(function (n, i) { drawSprite(x, S[n], i * w, 0, 1); });
    return (urlCache[key] = c.toDataURL());
  }
  function paintSprites(scope) {
    $$("[data-spr]", scope).forEach(function (el) {
      var rows = S[el.getAttribute("data-spr")];
      if (!rows) return;
      el.style.setProperty("--w", rows[0].length);
      el.style.setProperty("--h", rows.length);
      el.style.backgroundImage = "url(" + spriteURL(el.getAttribute("data-spr")) + ")";
    });
    /* Sabrina's avatar sprites (assets/avatar/avatar.js) use their own palette */
    var A = window.AVATAR_SPRITES;
    if (A) $$("[data-avatar]", scope).forEach(function (el) {
      var name = el.getAttribute("data-avatar"), rows = A[name];
      if (!rows) return;
      var key = "avatar:" + name;
      if (!urlCache[key]) {
        var c = doc.createElement("canvas");
        c.width = rows[0].length; c.height = rows.length;
        drawSprite(c.getContext("2d"), rows, 0, 0, 1, { pal: A.palette });
        urlCache[key] = c.toDataURL();
      }
      el.style.setProperty("--w", rows[0].length);
      el.style.setProperty("--h", rows.length);
      el.style.backgroundImage = "url(" + urlCache[key] + ")";
    });
  }

  /* ---------------------------------------------------------
     Pixel landscape (hero + CV banner)
     --------------------------------------------------------- */
  function pine(ctx, x, base, h, col, hi) {
    var tiers = h > 26 ? 4 : 3;
    var tierH = h / tiers;
    for (var r = 0; r < h; r++) {
      var t = r / h;
      var inTier = (r % tierH) / tierH;
      var w = Math.floor(t * h * 0.36 * (0.55 + 0.45 * inTier)) + (r > 1 ? 1 : 0);
      var y = base - h + r;
      ctx.fillStyle = col;
      ctx.fillRect(x - w, y, w * 2 + 1, 1);
      if (hi && w > 0 && (r % 3 !== 0)) { ctx.fillStyle = hi; ctx.fillRect(x + w, y, 1, 1); }
    }
  }

  function Landscape(canvas, cfg) {
    cfg = cfg || {};
    var ctx = canvas.getContext("2d");
    var px, W, H, OV = 18, layers = [], stars = [], flies = [], smoke = [], sky, chimney = null, lamp = null;
    var mouse = { x: 0, tx: 0, lx: -999, ly: -999 };
    var visible = true, raf = 0, last = 0, t0 = performance.now();

    function ridge(len, y0, amp, R, freq) {
      var p1 = R() * 9, p2 = R() * 9, p3 = R() * 9, out = [];
      freq = freq || 1;
      for (var x = 0; x < len; x++) {
        var s = 0.55 * Math.sin(x * 0.019 * freq + p1) + 0.3 * Math.sin(x * 0.047 * freq + p2) + 0.15 * Math.sin(x * 0.13 * freq + p3);
        out.push(Math.round(y0 - amp * (s * 0.5 + 0.5)));
      }
      return out;
    }
    function layer(depth) {
      var c = doc.createElement("canvas");
      c.width = W + OV * 2; c.height = H;
      var l = { c: c, x: c.getContext("2d"), d: depth };
      layers.push(l);
      return l;
    }

    function build() {
      var rect = canvas.getBoundingClientRect();
      px = window.innerWidth < 760 ? 3 : 4;
      W = Math.max(60, Math.ceil(rect.width / px));
      H = Math.max(40, Math.ceil(rect.height / px));
      canvas.width = W; canvas.height = H;
      layers = []; stars = []; flies = []; smoke = [];
      var R = rng(cfg.seed || 7);
      var horizon = Math.round(H * (cfg.horizon || 0.64));
      var LW = W + OV * 2;

      /* sky with ordered dithering */
      sky = doc.createElement("canvas");
      sky.width = W; sky.height = H;
      var sctx = sky.getContext("2d");
      var img = sctx.createImageData(W, H), d = img.data;
      var bands = ["#061317", "#0a1c21", "#0d262c", "#103038", "#153c42", "#1b4a4a", "#245a52", "#2e6a58"].map(hex);
      for (var y = 0; y < H; y++) {
        var t = Math.pow(clamp(y / (horizon + 6), 0, 1), 1.15) * (bands.length - 1);
        var bi = Math.floor(t), fr = t - bi;
        for (var x = 0; x < W; x++) {
          var c = bands[Math.min(bands.length - 1, fr > bayer(x, y) ? bi + 1 : bi)];
          var k = (y * W + x) * 4;
          d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
        }
      }
      /* moon + halo */
      var mx = Math.round(W * (cfg.moonX || 0.8)), my = Math.round(H * (cfg.moonY || 0.2));
      var mr = clamp(Math.round(H * 0.07), 6, 15);
      var halo = hex("#3b7a6c"), cream = hex("#f4ead0"), shade = hex("#d6c49a"), crater = hex("#e3d5ae");
      for (var yy = my - mr * 3; yy <= my + mr * 3; yy++) {
        for (var xx = mx - mr * 3; xx <= mx + mr * 3; xx++) {
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          var dd = Math.hypot(xx - mx, yy - my), kk = (yy * W + xx) * 4, col = null;
          if (dd <= mr) {
            col = cream;
            var lx = (xx - mx) / mr, ly = (yy - my) / mr;
            if (lx * 0.8 - ly * 0.3 < -0.45 && bayer(xx, yy) < 0.6) col = shade;
            if (Math.hypot(xx - (mx + mr * 0.3), yy - (my - mr * 0.2)) < mr * 0.22) col = crater;
            if (Math.hypot(xx - (mx - mr * 0.25), yy - (my + mr * 0.35)) < mr * 0.16) col = crater;
          } else if (dd < mr * 3) {
            var p = 1 - (dd - mr) / (mr * 2);
            if (p * p * 0.9 > bayer(xx, yy)) col = [Math.round((d[kk] + halo[0]) / 2), Math.round((d[kk + 1] + halo[1]) / 2), Math.round((d[kk + 2] + halo[2]) / 2)];
          }
          if (col) { d[kk] = col[0]; d[kk + 1] = col[1]; d[kk + 2] = col[2]; }
        }
      }
      sctx.putImageData(img, 0, 0);

      /* stars */
      var nStars = Math.round(W * horizon / 110);
      for (var i = 0; i < nStars; i++) {
        var sx = Math.floor(R() * W), sy = Math.floor(R() * horizon * 0.8);
        if (Math.hypot(sx - mx, sy - my) < mr * 3.2) continue;
        stars.push({ x: sx, y: sy, c: R() < 0.18 ? "#f5c451" : "#f4ead0", sp: 0.6 + R() * 2.2, ph: R() * 7, big: R() < 0.06 });
      }

      /* far mountains */
      var L1 = layer(0.12), r1 = ridge(LW, horizon - H * 0.03, H * 0.16, R, 0.8);
      for (var x1 = 0; x1 < LW; x1++) {
        L1.x.fillStyle = "#10333a"; L1.x.fillRect(x1, r1[x1], 1, H - r1[x1]);
        if (x1 > 0 && r1[x1] > r1[x1 - 1]) { L1.x.fillStyle = "#1c4d52"; L1.x.fillRect(x1, r1[x1], 1, 2); }
        else { L1.x.fillStyle = "#16424a"; L1.x.fillRect(x1, r1[x1], 1, 1); }
      }
      /* mist band */
      for (var my2 = horizon - 4; my2 < horizon + 6; my2++) for (var mx2 = 0; mx2 < LW; mx2++) {
        if (bayer(mx2, my2) < 0.35 - Math.abs(my2 - horizon) * 0.05) { L1.x.fillStyle = "#2b6359"; L1.x.fillRect(mx2, my2, 1, 1); }
      }

      /* mid hills + pines */
      var L2 = layer(0.3), r2 = ridge(LW, horizon + H * 0.05, H * 0.06, R, 1.3);
      for (var x2 = 0; x2 < LW; x2++) { L2.x.fillStyle = "#11352b"; L2.x.fillRect(x2, r2[x2], 1, H - r2[x2]); }
      for (var p2 = 2; p2 < LW; p2 += 4 + Math.floor(R() * 6)) {
        pine(L2.x, p2, r2[p2] + 2, Math.round(H * (0.05 + R() * 0.07)), "#11352b", "#1d4d3a");
      }

      /* village hill */
      var L3 = layer(0.5), r3 = ridge(LW, horizon + H * 0.15, H * 0.05, R, 0.9);
      for (var x3 = 0; x3 < LW; x3++) {
        L3.x.fillStyle = "#163f2c"; L3.x.fillRect(x3, r3[x3], 1, H - r3[x3]);
        L3.x.fillStyle = "#245a3b"; L3.x.fillRect(x3, r3[x3], 1, 1);
      }
      var hx = Math.round(OV + W * (cfg.houseX || 0.66));
      var hy = Math.min(r3[hx - 6], r3[hx], r3[hx + 6]) + 1;
      /* window glow */
      for (var gy = -22; gy <= 22; gy++) for (var gx = -26; gx <= 26; gx++) {
        var gd = Math.hypot(gx, gy * 1.3) / 26;
        if (gd < 1 && (1 - gd) * 0.55 > bayer(hx + gx, hy - 6 + gy)) {
          L3.x.fillStyle = gd < 0.45 ? "#4a6a33" : "#2b5636";
          var yy3 = hy - 6 + gy;
          if (yy3 < r3[hx + gx] ) L3.x.fillStyle = gd < 0.45 ? "#2e5a50" : "#1d4c4b";
          L3.x.fillRect(hx + gx, yy3, 1, 1);
        }
      }
      for (var x3b = 0; x3b < LW; x3b++) { L3.x.fillStyle = "#163f2c"; L3.x.fillRect(x3b, Math.max(r3[x3b] + 1, 0), 1, 0); }
      drawSprite(L3.x, S.house, hx - 8, hy - 16, 1);
      chimney = { x: hx + 5, y: hy - 15 };
      /* fence + lamp */
      L3.x.fillStyle = "#3b2618";
      for (var fx = hx - 22; fx < hx - 9; fx += 3) { L3.x.fillRect(fx, r3[fx] - 4, 1, 4); }
      L3.x.fillRect(hx - 22, r3[hx - 22] - 3, 13, 1);
      var lpx = hx + 14;
      L3.x.fillStyle = "#120f17"; L3.x.fillRect(lpx, r3[lpx] - 11, 1, 11); L3.x.fillRect(lpx - 1, r3[lpx] - 12, 3, 1);
      L3.x.fillStyle = "#f5c451"; L3.x.fillRect(lpx - 1, r3[lpx] - 11, 3, 2);
      lamp = { x: lpx, y: r3[lpx] - 10 };
      /* village side pines */
      [hx - 34, hx - 30, hx + 26, hx + 31, hx + 37].forEach(function (tx, j) {
        if (tx > 0 && tx < LW) pine(L3.x, tx, r3[tx] + 2, 12 + (j % 3) * 4, "#143a29", "#22543a");
      });

      /* near framing trees */
      var L4 = layer(0.78);
      var nearCol = "#0b2219", nearHi = "#163d29";
      var leftN = W < 220 ? 2 : 4;
      for (var a = 0; a < leftN; a++) {
        pine(L4.x, OV + Math.round(4 + a * 9 + R() * 6), H + 2, Math.round(H * (0.42 + R() * 0.28)), nearCol, nearHi);
        if (a < 2 || !cfg.clearRight) pine(L4.x, OV + W - Math.round(2 + a * 9 + R() * 4), H + 2, Math.round(H * (cfg.clearRight ? 0.3 + R() * 0.12 : 0.38 + R() * 0.3)), nearCol, nearHi);
      }

      /* foreground meadow */
      var L5 = layer(1.0);
      var gTop = H - Math.max(8, Math.round(H * 0.05));
      for (var x5 = 0; x5 < LW; x5++) {
        var gyv = gTop + Math.round(Math.sin(x5 * 0.21) * 1.2 + Math.sin(x5 * 0.07) * 1.5);
        L5.x.fillStyle = "#1f4d2e"; L5.x.fillRect(x5, gyv, 1, H - gyv);
        if (x5 % 3 === 0) { L5.x.fillStyle = "#2f6b34"; L5.x.fillRect(x5, gyv - 1, 1, 2); }
        if (R() < 0.05) { L5.x.fillStyle = R() < 0.5 ? "#f5c451" : "#ea9aa9"; L5.x.fillRect(x5, gyv + 1 + Math.floor(R() * 3), 1, 1); }
      }

      /* fireflies */
      var nFly = Math.round(W * H / 1300);
      for (var f = 0; f < nFly; f++) {
        flies.push({ x: R() * W, y: H * (0.38 + R() * 0.58), vx: (R() - 0.5) * 0.25, vy: (R() - 0.5) * 0.15, ph: R() * 7, sp: 0.8 + R() * 1.6, front: R() < 0.35 });
      }
    }

    function scrollPx() {
      var r = canvas.getBoundingClientRect();
      return clamp(-r.top, 0, r.height) / px;
    }

    function drawFlies(t, front) {
      for (var i = 0; i < flies.length; i++) {
        var f = flies[i];
        if (f.front !== front) continue;
        var b = 0.5 + 0.5 * Math.sin(t * f.sp + f.ph);
        b = b * b;
        if (b < 0.04) continue;
        var x = Math.round(f.x), y = Math.round(f.y);
        ctx.globalAlpha = b * 0.35;
        ctx.fillStyle = "#f5c451";
        ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
        ctx.globalAlpha = Math.min(1, b * 1.2);
        ctx.fillStyle = "#fff3a6";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    function step(dt) {
      for (var i = 0; i < flies.length; i++) {
        var f = flies[i];
        f.vx += (Math.random() - 0.5) * 0.03; f.vy += (Math.random() - 0.5) * 0.03;
        var dx = mouse.lx - f.x, dy = mouse.ly - f.y, dist = Math.hypot(dx, dy);
        if (dist < 46 && dist > 3) { f.vx += dx / dist * 0.02; f.vy += dy / dist * 0.02; }
        var sp = Math.hypot(f.vx, f.vy), max = 0.32;
        if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
        f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.x < -4) f.x = W + 3; if (f.x > W + 4) f.x = -3;
        if (f.y < H * 0.3) f.vy += 0.02; if (f.y > H - 3) f.vy -= 0.03;
      }
      if (chimney && Math.random() < 0.08 * dt) smoke.push({ x: chimney.x + 0.5, y: chimney.y, life: 0, max: 90 + Math.random() * 60 });
      for (var s = smoke.length - 1; s >= 0; s--) {
        var p = smoke[s];
        p.life += dt; p.y -= 0.12 * dt; p.x += (0.05 + Math.sin(p.life * 0.05) * 0.06) * dt;
        if (p.life > p.max) smoke.splice(s, 1);
      }
    }

    function render(now) {
      var t = (now - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      var sp = scrollPx();
      ctx.drawImage(sky, 0, 0);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], a = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = RM ? 0.8 : a;
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, 1, 1);
        if (s.big && a > 0.75) { ctx.globalAlpha = a * 0.4; ctx.fillRect(s.x - 1, s.y, 3, 1); ctx.fillRect(s.x, s.y - 1, 1, 3); }
      }
      ctx.globalAlpha = 1;
      for (var l = 0; l < layers.length; l++) {
        var L = layers[l];
        var ox = Math.round(-OV + mouse.x * OV * L.d);
        var oy = Math.round(sp * (1 - L.d) * 0.45);
        ctx.drawImage(L.c, ox, oy);
        if (l === 2) {
          /* smoke + lamp flicker live on the village layer */
          for (var k = 0; k < smoke.length; k++) {
            var p = smoke[k], fade = 1 - p.life / p.max;
            ctx.globalAlpha = fade * 0.55; ctx.fillStyle = "#9aa3a0";
            ctx.fillRect(Math.round(p.x + ox), Math.round(p.y + oy), p.life > 50 ? 2 : 1, 1);
          }
          ctx.globalAlpha = 1;
          if (lamp && !RM) {
            ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 7) * Math.sin(t * 3.1);
            ctx.fillStyle = "#f5c451";
            ctx.fillRect(lamp.x + ox - 2, lamp.y + oy - 2, 5, 5);
            ctx.globalAlpha = 1;
          }
          drawFlies(t, false);
        }
      }
      drawFlies(t, true);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      var dt = Math.min(4, (now - last) / 16.7);
      last = now;
      step(dt);
      render(now);
    }
    function start() { if (!raf && !RM) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    build();
    render(performance.now());
    if (!RM) {
      window.addEventListener("pointermove", function (e) {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        var r = canvas.getBoundingClientRect();
        mouse.lx = (e.clientX - r.left) / px; mouse.ly = (e.clientY - r.top) / px;
      }, { passive: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          visible = es[0].isIntersecting;
          if (visible && !doc.hidden) start(); else stop();
        }).observe(canvas);
      } else start();
      doc.addEventListener("visibilitychange", function () { if (doc.hidden) stop(); else if (visible) start(); });
    }
    var lastW = window.innerWidth;
    window.addEventListener("resize", debounce(function () {
      if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 760) return; /* ignore mobile URL-bar jiggle */
      lastW = window.innerWidth;
      build(); render(performance.now());
    }, 160));
  }

  /* ---------------------------------------------------------
     World map
     --------------------------------------------------------- */
  function initMap() {
    var map = $(".map");
    if (!map) return;
    var canvas = $(".map__terrain", map);
    var nodes = $$(".node", map);
    /* the party marker: Sabrina's tiny sprite standing on the trail */
    var party = doc.createElement("span");
    party.className = "map__party"; party.setAttribute("aria-hidden", "true");
    var partySpr = doc.createElement("i");
    partySpr.className = "spr"; partySpr.setAttribute("data-avatar", "tiny");
    party.appendChild(partySpr);
    $(".map__nodes", map).insertAdjacentElement("beforebegin", party);
    paintSprites(party);
    var route = { samples: [], at: [], px: 3, node: 0 };
    /* where the marker stands for landmark i: a few steps along the trail, clear of its sign */
    function anchor(i) {
      var sm = route.samples, k = route.at[i], dir = i === route.at.length - 1 ? -1 : 1, d = 0;
      while (sm[k + dir] && d < (route.mobile ? 34 : 24)) { d += Math.hypot(sm[k + dir][0] - sm[k][0], sm[k + dir][1] - sm[k][1]); k += dir; }
      return k;
    }
    function place(idx) {
      var p = route.samples[idx];
      if (!p) return;
      party.style.left = Math.round(p[0] * route.px) + "px";
      party.style.top = Math.round(p[1] * route.px) + "px";
    }
    var POS_D = [[0.08, 0.6], [0.25, 0.3], [0.43, 0.66], [0.6, 0.32], [0.77, 0.64], [0.92, 0.33]];
    var POS_M = [[0.27, 0.13], [0.72, 0.28], [0.28, 0.44], [0.72, 0.59], [0.28, 0.75], [0.7, 0.9]];

    function draw() {
      var mobile = map.clientWidth < 640;
      var P = mobile ? POS_M : POS_D;
      nodes.forEach(function (n, i) {
        n.style.setProperty("--x", (P[i][0] * 100) + "%");
        n.style.setProperty("--y", (P[i][1] * 100) + "%");
      });
      var px = 3;
      var W = Math.ceil(canvas.clientWidth / px), H = Math.ceil(canvas.clientHeight / px);
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext("2d");
      var R = rng(42);
      var pts = P.map(function (p) { return [p[0] * W, p[1] * H]; });

      /* smooth value noise for meadow patches */
      var G = 9, gw = Math.ceil(W / G) + 2, gh = Math.ceil(H / G) + 2, grid = [];
      for (var gi = 0; gi < gw * gh; gi++) grid.push(R());
      function noise(x, y) {
        var gx = x / G, gy = y / G, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
        fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
        var a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1];
        return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
      }

      /* path samples (Catmull-Rom) */
      var samples = [], at = [];
      for (var s = 0; s < pts.length - 1; s++) {
        at.push(samples.length);
        var p0 = pts[Math.max(0, s - 1)], p1 = pts[s], p2 = pts[s + 1], p3 = pts[Math.min(pts.length - 1, s + 2)];
        var segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        var n = Math.ceil(segLen * 2);
        for (var k = 0; k < n; k++) {
          var t = k / n, t2 = t * t, t3 = t2 * t;
          samples.push([
            0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
            0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
          ]);
        }
      }
      samples.push(pts[pts.length - 1]);
      at.push(samples.length - 1);
      route.samples = samples; route.at = at; route.px = px; route.mobile = mobile;
      place(anchor(route.node));

      var lake = mobile ? { x: W * 0.78, y: H * 0.075, rx: Math.max(10, W * 0.13), ry: Math.max(7, H * 0.045) }
                        : { x: W * 0.52, y: H * 0.17, rx: W * 0.06, ry: H * 0.11 };
      var mask = new Uint8Array(W * H); /* 1 path, 2 path edge, 3 water, 4 shore */
      samples.forEach(function (p) {
        for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) {
          var x = Math.round(p[0] + dx), y = Math.round(p[1] + dy);
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          var dd = Math.hypot(dx, dy);
          if (dd <= 1.8) mask[y * W + x] = 1;
          else if (dd <= 2.8 && mask[y * W + x] !== 1) mask[y * W + x] = 2;
        }
      });
      pts.forEach(function (p) {
        for (var dy = -7; dy <= 7; dy++) for (var dx = -11; dx <= 11; dx++) {
          var x = Math.round(p[0] + dx), y = Math.round(p[1] + dy);
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          var e = Math.hypot(dx / 11, dy / 7);
          if (e <= 0.85) mask[y * W + x] = 1; else if (e <= 1 && mask[y * W + x] !== 1) mask[y * W + x] = 2;
        }
      });
      for (var ly = 0; ly < H; ly++) for (var lx = 0; lx < W; lx++) {
        var le = Math.hypot((lx - lake.x) / lake.rx, (ly - lake.y) / lake.ry) + (noise(lx * 3, ly * 3) - 0.5) * 0.25;
        if (le < 1) mask[ly * W + lx] = 3; else if (le < 1.18 && mask[ly * W + lx] === 0) mask[ly * W + lx] = 4;
      }

      var img = ctx.createImageData(W, H), d = img.data;
      var C = {
        g0: hex("#2f6b34"), g1: hex("#2a6230"), g2: hex("#367540"), g3: hex("#3f8046"),
        path: hex("#b89a5e"), pathD: hex("#a08348"), edge: hex("#6f5a32"),
        w0: hex("#1f5d66"), w1: hex("#2a7680"), shore: hex("#cdb57a")
      };
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
        var m = mask[y * W + x], c, nz = noise(x, y), h = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        h = h < 0 ? h + 1 : h;
        if (m === 1) c = (h < 0.12) ? C.pathD : C.path;
        else if (m === 2) c = C.edge;
        else if (m === 3) c = ((x + y * 2) % 9 === 0 && h < 0.5) ? C.w1 : C.w0;
        else if (m === 4) c = C.shore;
        else {
          c = nz > 0.62 && bayer(x, y) < (nz - 0.55) * 3 ? C.g2 : C.g0;
          if (nz > 0.78 && bayer(x, y) < 0.5) c = C.g3;
          if (h < 0.08) c = C.g1;
        }
        var k2 = (y * W + x) * 4;
        d[k2] = c[0]; d[k2 + 1] = c[1]; d[k2 + 2] = c[2]; d[k2 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);

      /* footprints along the trail */
      ctx.fillStyle = "#8f7442";
      for (var fi = 6; fi < samples.length; fi += 14) {
        var a = samples[fi], b = samples[Math.min(samples.length - 1, fi + 1)];
        var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), side = (fi / 14) % 2 ? 1 : -1;
        var fx2 = Math.round(a[0] + Math.cos(ang + Math.PI / 2) * side), fy2 = Math.round(a[1] + Math.sin(ang + Math.PI / 2) * side);
        if (mask[fy2 * W + fx2] === 1) ctx.fillRect(fx2, fy2, 1, 1);
      }

      /* trees, flowers, rocks */
      var trees = [];
      var tries = Math.round(W * H / 14);
      for (var tr = 0; tr < tries; tr++) {
        var tx = Math.floor(R() * W), ty = Math.floor(R() * (H + 8));
        if (noise(tx, ty) < 0.55) continue;
        var ok = true;
        for (var dy2 = -11; dy2 <= 1 && ok; dy2 += 2) for (var dx2 = -4; dx2 <= 4; dx2 += 2) {
          var qx = tx + dx2, qy = ty + dy2;
          if (qx >= 0 && qy >= 0 && qx < W && qy < H && mask[qy * W + qx]) { ok = false; break; }
        }
        if (!ok) continue;
        for (var pi = 0; pi < pts.length; pi++) if (Math.hypot(pts[pi][0] - tx, pts[pi][1] - ty) < 26) { ok = false; break; }
        if (!ok) continue;
        for (var ti = 0; ti < trees.length; ti++) if (Math.abs(trees[ti][0] - tx) < 5 && Math.abs(trees[ti][1] - ty) < 4) { ok = false; break; }
        if (ok) trees.push([tx, ty]);
      }
      trees.sort(function (a2, b2) { return a2[1] - b2[1]; });
      trees.forEach(function (tt) {
        ctx.fillStyle = "rgba(10,30,18,.35)"; ctx.fillRect(tt[0] - 3, tt[1] - 1, 7, 2);
        drawSprite(ctx, S.pine, tt[0] - 3, tt[1] - 10, 1);
      });
      for (var fl = 0; fl < W * H / 90; fl++) {
        var fx3 = Math.floor(R() * W), fy3 = Math.floor(R() * H);
        if (mask[fy3 * W + fx3]) continue;
        ctx.fillStyle = ["#f5c451", "#ea9aa9", "#f4ead0", "#b9d86a"][Math.floor(R() * 4)];
        ctx.fillRect(fx3, fy3, 1, 1);
      }
      for (var rk = 0; rk < 10; rk++) {
        var rx = Math.floor(R() * W), ry = Math.floor(R() * H);
        if (mask[ry * W + rx]) continue;
        ctx.fillStyle = "#9aa3a0"; ctx.fillRect(rx, ry, 2, 1);
        ctx.fillStyle = "#5d6866"; ctx.fillRect(rx, ry + 1, 2, 1);
      }
      /* lake sparkle */
      ctx.fillStyle = "#69dccb";
      ctx.fillRect(Math.round(lake.x - lake.rx * 0.3), Math.round(lake.y - lake.ry * 0.2), 3, 1);
      ctx.fillRect(Math.round(lake.x + lake.rx * 0.2), Math.round(lake.y + lake.ry * 0.3), 2, 1);
    }
    draw();
    var lw = map.clientWidth;
    window.addEventListener("resize", debounce(function () { if (map.clientWidth !== lw) { lw = map.clientWidth; draw(); } }, 160));
  }

  /* ---------------------------------------------------------
     The world: one continuous pixel ground painted behind every area,
     from the world map down to the campfire. Same 3px art pixel, pine
     sprite, path colours and ink outline as the world map. Painted once
     per layout (no loop); the CSS tiles stay as the no-JS fallback.
     --------------------------------------------------------- */
  function ih(x, y) {
    var n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function initWorld() {
    var PX = 3;
    var isCV = !!$(".page-cv");
    var cfg = isCV
      ? { start: "#main", end: ".cv-foot", wrap: "#main", zones: [{ sel: "#main", biome: "clearing", blend: "village" }] }
      : { start: "#map", end: "#contact", wrap: "#projects .wrap", trail: true, zones: [
          { sel: "#map", biome: "village" },
          { sel: "#projects", biome: "forest", seam: "treeline" },
          { sel: "#art", biome: "cave", seam: "cliff" },
          { sel: "#skills", biome: "clearing", seam: "steps" },
          { sel: "#blog", biome: "square", seam: "fence" },
          { sel: "#contact", biome: "camp", seam: "nightpines" }
        ] };
    var startEl = $(cfg.start), endEl = $(cfg.end), wrapEl = $(cfg.wrap);
    if (!startEl || !endEl || !wrapEl) return;

    var RGB = {};
    function C(h) { return RGB[h] || (RGB[h] = hex(h)); }
    var BIO = {
      village:  { g: "#1f4d2e", p: "#24552f", t: "#2b6136", d: "#183f26", fl: ["#f5c451", "#ea9aa9", "#f4ead0"], fr: 0.004, path: ["#b89a5e", "#a08348", "#6f5a32"] },
      forest:   { g: "#1a412b", p: "#1e4830", t: "#245433", d: "#133322", fl: ["#b9d86a", "#6b5a34"], fr: 0.003, path: ["#a68a54", "#8f7442", "#5c4a2a"] },
      cave:     { g: "#122326", p: "#15292c", t: "#1b3235", d: "#0a1416", fl: ["#2a8a80", "#69dccb"], fr: 0.0012, path: ["#3d5355", "#33484b", "#0e181a"], stone: true },
      clearing: { g: "#163b36", p: "#1a443e", t: "#21524a", d: "#10302b", fl: ["#69dccb", "#9fc2b4", "#b9d86a"], fr: 0.003, path: ["#9b9273", "#847c60", "#4e4a38"], moon: true },
      square:   { g: "#22502f", p: "#265834", t: "#2e643a", d: "#1a4227", fl: ["#f5c451", "#ea9aa9", "#f4ead0"], fr: 0.0045, path: ["#b89a5e", "#a08348", "#6f5a32"] },
      camp:     { g: "#11261f", p: "#142c24", t: "#1a342a", d: "#0b1a16", fl: ["#3b5a3a", "#5d6866"], fr: 0.003, path: ["#6f5d3c", "#5e4f33", "#3a301f"] }
    };
    Object.keys(BIO).forEach(function (k) {
      var b = BIO[k];
      ["g", "p", "t", "d"].forEach(function (c) { b[c] = C(b[c]); });
      b.fl = b.fl.map(C); b.path = b.path.map(C);
    });
    var PINE_PAL = {
      forest: null, village: null,
      clearing: { m: "#7fb8a0", g: "#3f7f6a", G: "#235448", L: "#3b2618" },
      camp: { m: "#4f7a4a", g: "#2a5a34", G: "#183d27", L: "#2b1c12" }
    };
    var INK = C("#120f17"), ROCK_INK = C("#0b1416");
    var ROCK_DARK = { base: [C("#1b2c2f"), C("#1e3134"), C("#18282a")], hi: C("#26393b"), sh: C("#132123"), mo: C("#0b1517") };
    var ROCK_LIT = { base: [C("#2e4447"), C("#33494c"), C("#2a3e41")], hi: C("#45605f"), sh: C("#1f3134"), mo: C("#101b1d") };

    var box = doc.createElement("div");
    box.className = "world"; box.setAttribute("aria-hidden", "true");
    var cv = doc.createElement("canvas");
    box.appendChild(cv);
    doc.body.insertBefore(box, doc.body.firstChild);
    var ctx = cv.getContext("2d");
    var trailEl = $(".trail");
    var lastKey = "";

    function paint() {
      var sy = window.pageYOffset || 0;
      var top0 = Math.round(startEl.getBoundingClientRect().top + sy);
      var end = Math.round(endEl.getBoundingClientRect().bottom + sy);
      var cw = root.clientWidth;
      var W = Math.ceil(cw / PX), H = Math.ceil((end - top0) / PX);
      if (W < 20 || H < 20) return;
      var zones = cfg.zones.map(function (z) {
        var el = $(z.sel);
        var seam = el ? parseFloat(getComputedStyle(el).getPropertyValue("--seam")) || 0 : 0;
        return { b: BIO[z.biome], name: z.biome, seam: z.seam, blend: z.blend ? BIO[z.blend] : null,
                 top: el ? Math.round((el.getBoundingClientRect().top + sy - top0) / PX) : 0, sh: Math.round(seam / PX) };
      });
      zones.forEach(function (z, i) { z.bot = i < zones.length - 1 ? zones[i + 1].top : H; });
      var wr = wrapEl.getBoundingClientRect(), ws = getComputedStyle(wrapEl);
      var cl = Math.floor((wr.left + parseFloat(ws.paddingLeft)) / PX);
      var cr = Math.ceil((wr.right - parseFloat(ws.paddingRight)) / PX);
      var key = [W, H, cl].concat(zones.map(function (z) { return z.top + ":" + z.sh; })).join(",");
      if (key === lastKey) return;
      lastKey = key;

      cv.width = W; cv.height = H;
      cv.style.width = (W * PX) + "px"; cv.style.height = (H * PX) + "px";
      box.style.top = top0 + "px"; box.style.height = (end - top0) + "px";

      var img = ctx.createImageData(W, H), D = img.data;
      function set(x, y, c) {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        var k = (y * W + x) * 4; D[k] = c[0]; D[k + 1] = c[1]; D[k + 2] = c[2]; D[k + 3] = 255;
      }
      function get(x, y) { var k = (y * W + x) * 4; return [D[k], D[k + 1], D[k + 2]]; }
      function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }

      var cx = W >> 1;
      var trailOn = !!cfg.trail && cl >= 34;
      var tx0 = cl - 17;
      function tX(y) { return tx0 + Math.round(1.6 * Math.sin(y * 0.05) + 0.8 * Math.sin(y * 0.13 + 1)); }

      /* value noise for soft meadow patches */
      var G = 9, gw = Math.ceil(W / G) + 2, gh = Math.ceil(H / G) + 2, grid = new Float32Array(gw * gh);
      for (var gi = 0; gi < grid.length; gi++) grid[gi] = ih(gi, 4242);
      var nX0 = new Int32Array(W), nFX = new Float32Array(W), nRow = new Float32Array(gw), nRowY = -1;
      for (var nx = 0; nx < W; nx++) { var gxx = nx / G; nX0[nx] = Math.floor(gxx); var f0 = gxx - nX0[nx]; nFX[nx] = f0 * f0 * (3 - 2 * f0); }
      function noiseRow(y) {
        if (y === nRowY) return;
        nRowY = y;
        var gy = y / G, y0 = Math.floor(gy), fy = gy - y0;
        fy = fy * fy * (3 - 2 * fy);
        for (var i = 0; i < gw; i++) nRow[i] = grid[y0 * gw + i] * (1 - fy) + grid[(y0 + 1) * gw + i] * fy;
      }
      function noise(x) { var x0 = nX0[x], f = nFX[x]; return nRow[x0] * (1 - f) + nRow[x0 + 1] * f; }
      /* boulders: jittered-cell (Voronoi) stones, lit from above */
      var cellCache = {};
      function cells(seed, sx, sy) {
        var key2 = seed + ":" + sx + ":" + sy;
        if (cellCache[key2]) return cellCache[key2];
        var cols = Math.ceil(W / sx) + 3, rows = Math.ceil(H / sy) + 3, ax = new Float32Array(cols * rows), ay = new Float32Array(cols * rows);
        for (var r = 0; r < rows; r++) for (var q = 0; q < cols; q++) {
          var qx = q - 1, qy = r - 1;
          ax[r * cols + q] = (qx + 0.2 + ih(qx, qy * 7 + seed) * 0.6) * sx;
          ay[r * cols + q] = (qy + 0.2 + ih(qx * 3 + seed, qy) * 0.6) * sy;
        }
        return (cellCache[key2] = { cols: cols, ax: ax, ay: ay });
      }
      function rockAt(x, y, seed, sx, sy) {
        sx = sx || 11; sy = sy || 8;
        var cc = cells(seed, sx, sy);
        var gx = Math.floor(x / sx), gy = Math.floor(y / sy), f1 = 1e9, f2 = 1e9, id = 0, py = 0;
        for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) {
          var qx = gx + i, qy = gy + j, ci = (qy + 1) * cc.cols + qx + 1;
          var cxp = cc.ax[ci], cyp = cc.ay[ci];
          var ddx = x + 0.5 - cxp, ddy = (y + 0.5 - cyp) * 1.25, d = ddx * ddx + ddy * ddy;
          if (d < f1) { f2 = f1; f1 = d; id = qx * 9176 + qy; py = cyp; } else if (d < f2) f2 = d;
        }
        var e = Math.sqrt(f2) - Math.sqrt(f1);
        if (e < 1.1) return -1;
        if (e < 2.3 && y + 0.5 > py) return -3;
        if (y + 0.5 - py < -sy * 0.2 && e > 1.6) return -2;
        var v = ih(id, seed);
        return v < 0.4 ? 0 : v < 0.75 ? 1 : 2;
      }
      function rockCol(pal, code) { return code === -1 ? pal.mo : code === -2 ? pal.hi : code === -3 ? pal.sh : pal.base[code]; }

      /* biome at a pixel: inside a seam the two neighbours dither together */
      function zoneAt(y) { for (var i = zones.length - 1; i >= 0; i--) if (y >= zones[i].top) return i; return 0; }
      function biomeAt(x, y, zi) {
        var z = zones[zi];
        var prev = zi > 0 ? zones[zi - 1].b : z.blend;
        if (!prev) return z.b;
        var span = z.sh || 14;
        if (y >= z.top + span) return z.b;
        var t = clamp(((y - z.top) / span - 0.2) / 0.6, 0, 1);
        return t > bayer(x, y) ? z.b : prev;
      }

      /* ---- 1. ground ---- */
      var nCells = (W >> 3) + 1, tuftX = new Int32Array(nCells), tuftY = new Int32Array(nCells), cellRow = -1;
      for (var y = 0; y < H; y++) {
        var zi = zoneAt(y), z = zones[zi];
        noiseRow(y);
        var rowB = (zi > 0 || z.blend) && y < z.top + (z.sh || 14) ? null : z.b;
        if ((y >> 3) !== cellRow) {
          cellRow = y >> 3;
          for (var tc = 0; tc < nCells; tc++) {
            tuftY[tc] = ih(tc, cellRow + 913) < 0.5 ? (cellRow << 3) + 1 + Math.floor(ih(tc + 5, cellRow) * 5) : -1;
            tuftX[tc] = (tc << 3) + 1 + Math.floor(ih(tc, cellRow + 77) * 6);
          }
        }
        for (var x = 0; x < W; x++) {
          var b = rowB || biomeAt(x, y, zi), c, h = ih(x, y);
          {
            c = b.g;
            var nz = noise(x);
            var by = BAYER[((y & 3) << 2) + (x & 3)];
            if (nz > 0.6 && by < (nz - 0.55) * 3) c = b.p;
            if (b.moon && z.b === b) {
              var mh = z.bot - z.top - z.sh, my = z.top + z.sh + mh * 0.38;
              var mdx = (x - cx) / (W * 0.48), mdy = (y - my) / (mh * 0.46 + 1), md = Math.sqrt(mdx * mdx + mdy * mdy);
              if (md < 1 && (1 - md) * 0.75 > by) c = c === b.p ? b.t : b.p;
            }
            var ccx = x >> 3, oy = tuftY[ccx];
            if (oy >= 0 && (y === oy || y === oy + 1)) {
              var ox = tuftX[ccx];
              if ((x === ox && y === oy) || (y === oy + 1 && (x === ox - 1 || x === ox + 1))) c = b.t;
            }
            if (h < 0.035) c = b.d;
            if (h > 1 - b.fr) c = b.fl[Math.floor(ih(y, x) * b.fl.length)];
          }
          var k = (y * W + x) * 4;
          D[k] = c[0]; D[k + 1] = c[1]; D[k + 2] = c[2]; D[k + 3] = 255;
        }
      }

      /* ---- 2. light pools (lamps, campfire) ---- */
      function glow(gx, gy, rx, ry, cols, strength) {
        for (var yy = Math.floor(gy - ry); yy <= gy + ry; yy++) for (var xx = Math.floor(gx - rx); xx <= gx + rx; xx++) {
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          var ex = (xx - gx) / rx, ey = (yy - gy) / ry, d = Math.sqrt(ex * ex + ey * ey);
          if (d >= 1 || (1 - d) * strength < bayer(xx, yy)) continue;
          set(xx, yy, d < 0.35 ? cols[0] : d < 0.7 ? cols[1] : cols[2]);
        }
      }
      var lamps = [], houses = [], trees = [];
      zones.forEach(function (z) {
        if (z.name === "square") {
          /* a cobbled village square under the notice board */
          var planks = $(".board__planks");
          if (planks) {
            var br = planks.getBoundingClientRect();
            var pcx = (br.left + br.width / 2) / PX, pcy = (br.top + br.height / 2 + 24 + sy - top0) / PX;
            var prx = br.width / 2 / PX + 18, pry = br.height / 2 / PX + 22;
            var COB = { base: [C("#4a5646"), C("#515d4c"), C("#465142")], hi: C("#66735d"), sh: C("#3a4539"), mo: C("#283126") };
            for (var qy = Math.floor(pcy - pry); qy <= pcy + pry; qy++) for (var qx = Math.floor(pcx - prx); qx <= pcx + prx; qx++) {
              if (qx < 0 || qy < 0 || qx >= W || qy >= H) continue;
              var pex = (qx - pcx) / prx, pey = (qy - pcy) / pry, pd = Math.sqrt(pex * pex + pey * pey);
              if (pd > 1 || (pd > 0.9 && (pd - 0.9) * 10 > bayer(qx, qy))) continue;
              set(qx, qy, rockCol(COB, rockAt(qx, qy, 21, 5, 4)));
            }
            lamps.push([Math.round(pcx - prx + 7), Math.round(pcy - pry * 0.45)]);
            lamps.push([Math.round(pcx + prx - 7), Math.round(pcy - pry * 0.45)]);
          }
          if (W - cr >= 22) houses.push([cr + Math.round((W - cr) / 2) - 8, z.top + Math.round(z.sh * 0.16)]);
          lamps.forEach(function (l) { glow(l[0], l[1] + 1, 18, 10, [C("#5f6a34"), C("#46622f"), C("#2f5a33")], 0.9); });
        }
        if (z.name === "camp") {
          var fire = $(".campfire");
          if (fire) {
            var fr = fire.getBoundingClientRect();
            var fxp = Math.round((fr.left + fr.width / 2) / PX), fyp = Math.round((fr.bottom + sy - top0) / PX) - 2;
            glow(fxp, fyp, 70, 30, [C("#3a3418"), C("#2a2c1a"), C("#1a2a1e")], 0.85);
          }
        }
      });

      /* ---- 3. the trail, continued from the world map ---- */
      if (trailOn) {
        for (var ty = 0; ty < H; ty++) {
          var tzi = zoneAt(ty), tx = tX(ty), tb = biomeAt(tx, ty, tzi);
          for (var dx = -2; dx <= 2; dx++) {
            var col;
            if (Math.abs(dx) === 2) col = tb.path[2];
            else if (tb.stone) col = ty % 4 === 0 ? tb.path[2] : ty % 4 === 1 ? tb.path[1] : tb.path[0];
            else col = ih(tx + dx, ty) < 0.12 ? tb.path[1] : tb.path[0];
            set(tx + dx, ty, col);
          }
          if (!tb.stone && ty % 14 === 6) set(tx + ((ty / 14) % 2 ? 1 : -1), ty, tb.path[1]);
        }
        /* a clearing on the trail beside every area name, like the map's landmarks */
        $$(".area-head__icon").forEach(function (ic) {
          var r = ic.getBoundingClientRect();
          var ny = Math.round((r.top + r.height / 2 + sy - top0) / PX);
          if (ny < 4 || ny > H - 4) return;
          var nx = tX(ny), nb = biomeAt(nx, ny, zoneAt(ny));
          for (var yy = -5; yy <= 5; yy++) for (var xx = -8; xx <= 8; xx++) {
            var e = Math.hypot(xx / 7.5, yy / 4.5);
            if (e <= 0.82) set(nx + xx, ny + yy, ih(nx + xx, ny + yy) < 0.12 ? nb.path[1] : nb.path[0]);
            else if (e <= 1) set(nx + xx, ny + yy, nb.path[2]);
          }
        });
      }

      /* ---- 4. seams between areas ---- */
      var carve = new Uint8Array(H);
      function outlineFill(x0, y0, x1, y1, inside, colour, ink) {
        var w = x1 - x0, hgt = y1 - y0;
        if (w <= 0 || hgt <= 0) return null;
        var m = new Uint8Array(w * hgt);
        for (var yy = 0; yy < hgt; yy++) for (var xx = 0; xx < w; xx++) if (inside(x0 + xx, y0 + yy)) m[yy * w + xx] = 1;
        function at(xx, yy) { return xx < 0 || yy < 0 || xx >= w || yy >= hgt ? 1 : m[yy * w + xx]; }
        for (var y2 = 0; y2 < hgt; y2++) for (var x2 = 0; x2 < w; x2++) {
          if (!m[y2 * w + x2]) continue;
          var edge = !at(x2 - 1, y2) || !at(x2 + 1, y2) || !at(x2, y2 - 1) || !at(x2, y2 + 1);
          set(x0 + x2, y0 + y2, edge ? ink : colour(x0 + x2, y0 + y2));
        }
        return function (x, y) { var xx = x - x0, yy = y - y0; return xx >= 0 && yy >= 0 && xx < w && yy < hgt && m[yy * w + xx] === 1; };
      }

      function treeRow(z, rows, pal) {
        for (var r = 0; r < rows; r++) {
          var base = z.top + 11 + Math.round(r * (z.sh - 18) / Math.max(1, rows - 1));
          for (var x = -3 + (r % 2) * 3; x < W + 4; x += 4 + Math.floor(ih(x, r + 51) * 3)) {
            var ty = base + Math.floor(ih(x, r + 7) * 4);
            if (trailOn && Math.abs(x - tX(ty)) < 7) continue;
            if (ih(x, r + 99) < 0.12) continue;
            trees.push([x, ty, pal]);
          }
        }
      }
      function marginTrees(z, density, pal) {
        var y0 = z.top + z.sh + 4, y1 = z.bot - 6;
        for (var y = y0; y < y1; y += 4) for (var x = 1; x < W; x += 5) {
          if (ih(x, y + 313) > density) continue;
          var px2 = x + Math.floor(ih(y, x) * 3) - 1, py2 = y + Math.floor(ih(x, y) * 3);
          if (px2 + 5 > cl - 2 && px2 - 5 < cr + 2) continue;
          if (trailOn && Math.abs(px2 - tX(py2)) < 8) continue;
          trees.push([px2, py2, pal]);
        }
      }

      var cave = null;
      zones.forEach(function (z, zi) {
        if (z.name === "village" || z.name === "forest") marginTrees(z, z.name === "forest" ? 0.42 : 0.16, null);
        if (z.name === "clearing" && !isCV) marginTrees(z, 0.1, PINE_PAL.clearing);
        if (z.name === "camp") marginTrees(z, 0.12, PINE_PAL.camp);
        if (z.seam === "treeline") treeRow(z, 4, null);
        if (z.seam === "nightpines") treeRow(z, 4, PINE_PAL.camp);
        if (z.seam === "cliff") cave = { z: z, exit: zones[zi + 1] && zones[zi + 1].seam === "steps" ? zones[zi + 1] : null };
        if (z.seam === "fence") {
          var yf = z.top + Math.round(z.sh * 0.62);
          var gate = trailOn ? tX(yf) : cx;
          outlineFill(0, yf - 14, W, yf + 1, function (x, y) {
            var g = Math.abs(x - gate);
            if (g < 6) return false;
            var post = ((x + 400) % 11) < 3 || (g >= 6 && g <= 8);
            if (post) return y >= yf - (g <= 8 ? 14 : 11);
            return (y >= yf - 9 && y <= yf - 7) || (y >= yf - 4 && y <= yf - 2);
          }, function (x, y) {
            var g = Math.abs(x - gate);
            if (g <= 8 && y <= yf - 12) return y === yf - 13 && g === 7 ? C("#fff3a6") : C("#f5c451");
            var post = ((x + 400) % 11) < 3 || (g >= 6 && g <= 8);
            if (post) return ((x + 400) % 11) === 0 || g === 6 ? C("#b07a43") : ((x + 400) % 11) === 2 || g === 8 ? C("#3b2618") : C("#6b4423");
            return y === yf - 8 || y === yf - 3 ? C("#b07a43") : C("#6b4423");
          }, INK);
          /* flower beds along the fence */
          for (var fx = 0; fx < W; fx++) {
            if (Math.abs(fx - gate) < 8) continue;
            if (ih(fx, 777) < 0.3) set(fx, yf + 1, C("#163a22"));
            if (ih(fx, 778) < 0.12) set(fx, yf + 1 + Math.floor(ih(fx, 779) * 2), [C("#f5c451"), C("#ea9aa9"), C("#f4ead0")][Math.floor(ih(fx, 780) * 3)]);
          }
        }
      });

      /* the cave: cliff with a keystone arch, rock walls, stone steps out */
      if (cave) {
        var cz = cave.z, ez = cave.exit;
        var y0 = cz.top, y1 = cz.top + cz.sh;
        var a = Math.round(Math.min(W * 0.34, 150)), hc = Math.min(Math.round(a * 0.42), cz.sh - 24), yA = y0 + 16;
        var a2 = Math.round(Math.min(W * 0.3, 128));
        var wallL = trailOn ? tx0 - 7 : cl - 6;
        var wallR = W - 1 - wallL;
        var hasWalls = wallL >= 3;
        var yEnd = ez ? ez.top + ez.sh : cz.bot;
        function hw(y, A, Hh, apex) {
          if (y < apex) return -1;
          var yc = apex + Hh;
          if (y >= yc) return A;
          var t = (yc - y) / Hh;
          return A * Math.sqrt(1 - t * t);
        }
        function cliffTop(x) { return y0 + 6 + (ih(x >> 1, 501) < 0.5 ? 0 : 1); }
        function exitBot(x) { return yEnd - 4 - Math.floor(ih(x >> 1, 602) * 5); }
        function inRock(x, y) {
          if (y < y1) {
            if (y < cliffTop(x)) return false;
            return Math.abs(x + 0.5 - cx) > hw(y, a + 6, hc + 6, yA - 6);
          }
          if (ez && y >= ez.top) {
            if (y >= exitBot(x)) return false;
            var jag = Math.floor(ih(y >> 1, 601) * 3);
            if (Math.abs(x + 0.5 - cx) > a2 + jag + (y < ez.top + 3 ? 2 : 0)) return true;
          }
          if (!hasWalls) return false;
          var wj = Math.round(1.5 * Math.sin(y * 0.09) + ih(y >> 2, 7) * 2);
          return x < wallL + wj || x > wallR - wj;
        }
        /* opening + stairs first, so the rock overlaps their ends */
        for (var oy = yA; oy < y1; oy++) {
          var half = hw(oy, a, hc, yA);
          var t = (oy - yA) / (y1 - yA);
          for (var ox = Math.floor(cx - half); ox <= cx + half; ox++) {
            if (Math.abs(ox + 0.5 - cx) > half) continue;
            if (t > 0.55 && (t - 0.55) * 2.4 > bayer(ox, oy)) continue;
            set(ox, oy, t < 0.25 ? C("#050b0d") : C("#081316"));
          }
        }
        if (ez) {
          var ys0 = ez.top + 4, n = 5, hs = Math.max(4, Math.floor((ez.sh - 14) / n));
          var c0 = C("#1b2d30"), c1 = C("#5e837b");
          for (var i = 0; i < n; i++) {
            var sc = mix(c0, c1, i / (n - 1)), hi = mix(sc, C("#9fc2b4"), 0.35), lo = mix(sc, C("#0b1416"), 0.45);
            var sw2 = a2 + 4 - (n - 1 - i) * 2;
            for (var s = 0; s < hs; s++) {
              var yy = ys0 + i * hs + s;
              for (var sx = cx - sw2; sx <= cx + sw2; sx++) {
                var cc = s === hs - 1 ? ROCK_INK : s === 0 ? hi : s >= hs - 2 ? lo : sc;
                if (Math.abs(sx - cx) === sw2) cc = ROCK_INK;
                if (s > 0 && s < hs - 2 && i > 1 && ih(sx, yy) < 0.04) cc = C("#2f6b34");
                set(sx, yy, cc);
              }
            }
          }
        }
        var isRock = outlineFill(0, y0, W, yEnd, inRock, function (x, y) {
          var lit;
          if (y < y1) lit = 1;
          else if (ez && y >= ez.top) lit = (y - ez.top) / ez.sh * 0.8;
          else lit = 0;
          return rockCol(lit > bayer(x, y) ? ROCK_LIT : ROCK_DARK, rockAt(x, y, 11));
        }, ROCK_INK);
        /* grass lip and moss drips on top of the cliff */
        for (var gx = 0; gx < W; gx++) {
          var top = cliffTop(gx);
          if (!isRock(gx, top)) continue;
          set(gx, top, ih(gx, 502) < 0.7 ? C("#2f6b34") : ROCK_INK);
          if (ih(gx, 505) < 0.35) set(gx, top - 1, C("#62a447"));
          if (ih(gx, 503) < 0.14) {
            var len = 1 + Math.floor(ih(gx, 504) * 5);
            for (var k2 = 1; k2 <= len; k2++) if (isRock(gx, top + k2)) set(gx, top + k2, k2 === len ? C("#1f4d2e") : C("#2f6b34"));
          }
        }
        /* cast shadow under the cliff */
        for (var shy = y1; shy < y1 + 5; shy++) for (var shx = 0; shx < W; shx++) {
          if (isRock(shx, shy) || Math.abs(shx + 0.5 - cx) <= a) continue;
          if ((y1 + 5 - shy) / 6 > bayer(shx, shy)) set(shx, shy, C("#070f11"));
        }
        /* the arch: cut voussoirs with a crystal keystone */
        var nSeg = 15;
        outlineFill(cx - a - 8, yA - 7, cx + a + 9, y1, function (x, y) {
          var d = Math.abs(x + 0.5 - cx);
          return d > hw(y, a, hc, yA) && d <= hw(y, a + 6, hc + 6, yA - 6);
        }, function (x, y) {
          var yc = yA + hc, joint, seg;
          if (y < yc) {
            var ang = Math.atan2((yc - y) / (hc + 3), (x + 0.5 - cx) / (a + 3)) / Math.PI * nSeg;
            seg = Math.floor(ang); joint = ang - seg < 0.1;
          } else { seg = 40 + Math.floor((y - yc) / 6) * 2 + (x < cx ? 0 : 1); joint = (y - yc) % 6 === 5; }
          if (joint) return ROCK_INK;
          var dIn = Math.abs(x + 0.5 - cx) - hw(y, a, hc, yA);
          var dOut = hw(y, a + 6, hc + 6, yA - 6) - Math.abs(x + 0.5 - cx);
          if (dIn < 1.6) return C("#2e4446");
          if (dOut < 1.6 && y < yc) return C("#8fa9a3");
          return ih(seg, 9) < 0.5 ? C("#6a8682") : C("#5f7a77");
        }, ROCK_INK);
        outlineFill(cx - 6, yA - 10, cx + 7, yA + 4, function (x, y) {
          return !(y > yA && Math.abs(x + 0.5 - cx) > 4.5 - (y - yA));
        }, function (x, y) {
          var gx2 = x - cx, gy2 = y - (yA - 3);
          if (Math.abs(gx2) + Math.abs(gy2) <= 2) return gx2 + gy2 < -1 ? C("#c8fff6") : (gx2 + gy2 > 0 ? C("#2a8a80") : C("#69dccb"));
          return y === yA - 9 ? C("#b3cbc4") : x === cx + 5 ? C("#56716f") : C("#8fa9a3");
        }, ROCK_INK);
        /* the trail climbs through the rock on cut steps */
        if (trailOn) for (var ry = y0; ry < yEnd; ry++) if (isRock(tX(ry), ry)) carve[ry] = 1;
      }

      if (trailOn) {
        for (var cy2 = 0; cy2 < H; cy2++) {
          if (!carve[cy2]) continue;
          var tx3 = tX(cy2), ph = cy2 % 3;
          for (var dx3 = -3; dx3 <= 3; dx3++) {
            var c3 = Math.abs(dx3) === 3 ? ROCK_INK : ph === 0 ? C("#7d918c") : ph === 1 ? C("#56696a") : ROCK_INK;
            set(tx3 + dx3, cy2, c3);
          }
        }
      }

      ctx.putImageData(img, 0, 0);

      /* ---- 5. sprites: pines (the world map's own), cottages, lamps ---- */
      trees.sort(function (p, q) { return p[1] - q[1]; });
      var pineCache = [];
      function pineImg(pal) {
        for (var i = 0; i < pineCache.length; i++) if (pineCache[i][0] === pal) return pineCache[i][1];
        var pc = doc.createElement("canvas"); pc.width = S.pine[0].length; pc.height = S.pine.length;
        drawSprite(pc.getContext("2d"), S.pine, 0, 0, 1, pal ? { pal: Object.assign({}, PAL, pal) } : null);
        pineCache.push([pal, pc]);
        return pc;
      }
      trees.forEach(function (t) {
        var under = get(clamp(t[0], 0, W - 1), clamp(t[1], 0, H - 1));
        ctx.fillStyle = "rgb(" + mix(under, [6, 14, 10], 0.45).join(",") + ")";
        ctx.fillRect(t[0] - 3, t[1] - 1, 7, 2);
        ctx.drawImage(pineImg(t[2]), t[0] - 3, t[1] - 10);
      });
      houses.forEach(function (hh) { if (S.house) drawSprite(ctx, S.house, hh[0], hh[1], 1); });
      lamps.forEach(function (l) {
        ctx.fillStyle = "#120f17";
        ctx.fillRect(l[0], l[1] - 16, 1, 16); ctx.fillRect(l[0] - 2, l[1] - 21, 5, 1); ctx.fillRect(l[0] - 2, l[1] - 16, 5, 1);
        ctx.fillRect(l[0] - 2, l[1] - 20, 1, 4); ctx.fillRect(l[0] + 2, l[1] - 20, 1, 4); ctx.fillRect(l[0] - 2, l[1], 5, 1);
        ctx.fillStyle = "#f5c451"; ctx.fillRect(l[0] - 1, l[1] - 20, 3, 4);
        ctx.fillStyle = "#fff3a6"; ctx.fillRect(l[0], l[1] - 19, 1, 2);
      });

      if (trailEl) {
        trailEl.classList.toggle("is-on", trailOn);
        if (trailOn) {
          trailEl.style.top = top0 + "px";
          trailEl.style.height = (end - top0) + "px";
          trailEl.style.left = (tx0 * PX + PX / 2) + "px";
        }
      }
    }

    function first() {
      if (first.done) return; first.done = true;
      paint();
      root.classList.add("world-on");
      var again = debounce(paint, 140);
      window.addEventListener("resize", again);
      if ("ResizeObserver" in window) new ResizeObserver(again).observe(doc.body);
    }
    /* the hero fills the first screen, so the world waits for fonts (stable layout)
       and for an idle moment, keeping the one-off paint clear of the intro */
    function kick() {
      if (first.done) return;
      if (window.requestIdleCallback) requestIdleCallback(first, { timeout: 1500 }); else setTimeout(first, 0);
    }
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(kick);
    setTimeout(kick, 1200);
  }

  /* ---------------------------------------------------------
     Title + dialogue typing
     --------------------------------------------------------- */
  function initTitle() {
    var h1 = $(".hero h1");
    if (!h1) return;
    var big = $(".t-big", h1);
    if (!big || RM) return;
    var text = big.textContent;
    big.textContent = "";
    var sr = doc.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
    var vis = doc.createElement("span"); vis.setAttribute("aria-hidden", "true");
    text.split("").forEach(function (ch, i) {
      var s = doc.createElement("span"); s.className = "ch"; s.style.setProperty("--i", i); s.textContent = ch;
      vis.appendChild(s);
    });
    big.appendChild(sr); big.appendChild(vis);
  }

  function initDialogue() {
    var dlg = $(".dlg");
    var p = dlg && $("[data-type]", dlg);
    if (!p) return;
    var finished = false;
    function done() { if (finished) return; finished = true; $$(".c", p).forEach(function (c) { c.classList.add("on"); }); dlg.classList.add("is-done"); }
    if (RM) { done(); return; }
    var text = p.textContent.trim();
    p.textContent = "";
    var sr = doc.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
    var vis = doc.createElement("span"); vis.setAttribute("aria-hidden", "true");
    var chars = text.split("").map(function (ch) {
      var s = doc.createElement("span"); s.className = "c"; s.textContent = ch; vis.appendChild(s); return s;
    });
    p.appendChild(sr); p.appendChild(vis);
    var i = 0;
    function tick() {
      if (finished) return;
      if (i >= chars.length) { done(); return; }
      chars[i].classList.add("on");
      var ch = chars[i].textContent; i++;
      setTimeout(tick, /[.,]/.test(ch) ? 180 : 30);
    }
    setTimeout(tick, 1100);
    setTimeout(done, 6500);
    $(".dlg__box", dlg).addEventListener("click", function (e) { if (!e.target.closest("a,button")) done(); });
    doc.addEventListener("keydown", function (e) { if (!finished && (e.key === "Enter" || e.key === " ") && !e.target.closest("a,button,input,[tabindex]")) done(); });
  }

  /* ---------------------------------------------------------
     Party-member portrait: Sabrina's hand-pixelled avatar
     (assets/avatar/avatar.js), drawn 1:1 on a 64x64 canvas and scaled
     by whole numbers in CSS. She blinks now and then and smiles while
     her box is hovered or focused. The HD switch dithers the sprite
     away to reveal the original picture, and back again.
     --------------------------------------------------------- */
  var AV = window.AVATAR_SPRITES || null;
  var portraits = [];
  function avatarRows(name) {
    if (name !== "blinkSmile") return AV[name];
    var r = AV.smile.slice();
    AV.blink.forEach(function (row, i) { if (row !== AV.base[i]) r[i] = row; });
    return r;
  }
  function initPortraits() {
    if (!AV) return;
    var N = AV.base.length;
    var frameCache = {};
    function frame(name) {
      if (frameCache[name]) return frameCache[name];
      var c = doc.createElement("canvas");
      c.width = c.height = N;
      var x = c.getContext("2d");
      /* warm parchment backdrop, Bayer-dithered towards the bottom */
      var top = hex("#f4ead0"), bot = hex("#e2cd9c"), img = x.createImageData(N, N), d = img.data;
      for (var y = 0; y < N; y++) for (var xx = 0; xx < N; xx++) {
        var col = (y / N) * 1.15 - 0.1 > bayer(xx, y) ? bot : top, k = (y * N + xx) * 4;
        d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      drawSprite(x, avatarRows(name), 0, 0, 1, { pal: AV.palette });
      return (frameCache[name] = c);
    }
    var HD_SRC = "assets/pfp.jpg";
    var HD_ALT = "Sabrina's profile picture: an anime-style portrait with dark wavy hair";

    $$("[data-portrait]").forEach(function (el) {
      var cv = $("canvas", el), pxImg = $(".portrait__px", el);
      if (!cv) return;
      var ctx = cv.getContext("2d");
      cv.width = cv.height = N;
      var P = { el: el, hd: false, mask: 0, blink: false, smile: false, seen: true, timer: 0, blinkT: 0, photo: null };
      var pxAlt = pxImg ? pxImg.getAttribute("alt") : "";

      function render() {
        var name = P.smile ? (P.blink ? "blinkSmile" : "smile") : (P.blink ? "blink" : "base");
        ctx.clearRect(0, 0, N, N);
        if (P.mask >= 1) return;
        ctx.drawImage(frame(name), 0, 0);
        /* the HD dissolve: clear 2x2 cells in ordered-dither order */
        if (P.mask > 0) for (var y = 0; y < N; y += 2) for (var x = 0; x < N; x += 2) {
          if (bayer(x >> 1, y >> 1) < P.mask) ctx.clearRect(x, y, 2, 2);
        }
      }
      function photo() {
        if (P.photo) return P.photo;
        var im = doc.createElement("img");
        im.className = "portrait__hd"; im.alt = ""; im.decoding = "async";
        im.src = HD_SRC;
        el.insertBefore(im, el.firstChild);
        return (P.photo = im);
      }
      function blinkOnce(then) { P.blink = true; render(); setTimeout(function () { P.blink = false; render(); if (then) then(); }, 130); }
      function blinkLoop() {
        clearTimeout(P.blinkT);
        if (RM) return;
        P.blinkT = setTimeout(function () {
          if (!P.hd && P.seen && !doc.hidden) blinkOnce(Math.random() < 0.18 ? function () { setTimeout(blinkOnce, 140); } : null);
          blinkLoop();
        }, 2400 + Math.random() * 3800);
      }

      P.set = function (hd) {
        if (hd === P.hd) return;
        P.hd = hd;
        clearTimeout(P.timer);
        var im = photo();
        /* swap which image carries the description */
        if (pxAlt) { im.alt = hd ? HD_ALT : ""; if (pxImg) pxImg.alt = hd ? "" : pxAlt; }
        el.classList.add("is-hd");
        var seq = hd ? [0.25, 0.5, 0.75, 1] : [0.75, 0.5, 0.25, 0];
        if (RM) seq = [hd ? 1 : 0];
        var i = 0;
        function next() {
          P.mask = seq[i++]; render();
          if (i < seq.length) P.timer = setTimeout(next, 80);
          else if (!hd) el.classList.remove("is-hd");
        }
        /* first time: wait for the picture, so the dither reveals it rather than a blank */
        if (hd && !(im.complete && im.naturalWidth)) {
          var go = function () { im.removeEventListener("load", go); im.removeEventListener("error", go); if (P.hd) next(); };
          im.addEventListener("load", go); im.addEventListener("error", go);
        } else next();
      };

      var host = el.closest(".dlg__box, .card, .slot") || el;
      function smile(on) { if (P.smile !== on) { P.smile = on; render(); } }
      host.addEventListener("pointerenter", function () { smile(true); });
      host.addEventListener("pointerleave", function () { if (!host.contains(doc.activeElement)) smile(false); });
      host.addEventListener("focusin", function () { smile(true); });
      host.addEventListener("focusout", function (e) { if (!host.contains(e.relatedTarget) && !host.matches(":hover")) smile(false); });

      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { P.seen = es[0].isIntersecting; }).observe(el);
      render();
      el.classList.add("is-ready");
      blinkLoop();
      portraits.push(P);
    });
    $$(".hd-toggle").forEach(function (btn) {
      /* start fetching the picture as soon as someone reaches for the switch */
      function warm() { portraits.forEach(function (p) { if (!p.photo) { var im = new Image(); im.src = HD_SRC; } }); }
      btn.addEventListener("pointerenter", warm, { once: true });
      btn.addEventListener("focus", warm, { once: true });
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        $$(".hd-toggle").forEach(function (b) { b.setAttribute("aria-pressed", String(on)); });
        portraits.forEach(function (p) { p.set(on); });
      });
    });
  }

  /* ---------------------------------------------------------
     Navigation, active area, area banner
     --------------------------------------------------------- */
  var bannerTimer = 0;
  function showBanner(name, sub) {
    var b = $(".area-banner");
    if (!b) return;
    $("[data-banner-name]", b).textContent = name;
    $("small", b).textContent = sub || "Now entering";
    b.classList.add("is-on");
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { b.classList.remove("is-on"); }, 1900);
  }

  function initAnchors() {
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      var id = a.getAttribute("href").slice(1);
      var el = id ? doc.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
      if (history.pushState) history.pushState(null, "", "#" + id);
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    });
  }

  function initNav() {
    var btn = $(".hud__menu"), nav = $("#hudNav");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
      $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }); });
      doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); } });
    }

    var AREAS = { home: "The Village", projects: "Quest Log", art: "Gallery Dungeon", skills: "Character Sheet", blog: "Notice Board", contact: "Campfire" };
    var links = $$(".hud__nav a[data-area]");
    var userMoved = false, current = null;
    ["wheel", "touchmove", "keydown", "click"].forEach(function (ev) { window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true }); });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        if (id === current) return;
        current = id;
        links.forEach(function (a) { if (a.getAttribute("data-area") === id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
        if (userMoved && AREAS[id]) showBanner(AREAS[id]);
      });
    }, { rootMargin: "-42% 0px -52% 0px" });
    Object.keys(AREAS).forEach(function (id) { var el = doc.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------------------------------------------------------
     Quest log tabs + objectives
     --------------------------------------------------------- */
  function initQuests() {
    var tabs = $$(".qtab");
    if (!tabs.length) return;
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    select(0);

    root.style.setProperty("--check", "url(" + spriteURL("check") + ")");
    var list = $("[data-objectives]");
    if (!list || RM || !("IntersectionObserver" in window)) return;
    list.classList.add("is-pending");
    var items = $$("li", list), fired = false;
    function run() {
      if (fired) return; fired = true;
      items.forEach(function (li, i) { setTimeout(function () { li.classList.add("done"); }, 250 + i * 230); });
    }
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(list);
    setTimeout(run, 4500);
  }

  /* ---------------------------------------------------------
     Gallery carousel
     --------------------------------------------------------- */
  function initCarousel() {
    var car = $("[data-carousel]");
    if (!car) return;
    var vp = $(".gallery__viewport", car), track = $(".gallery__track", car);
    var slides = $$(".slide", car), n = slides.length, i = 0;
    var dotsWrap = $(".gallery__dots", car), count = $("[data-count]", car);
    var dots = slides.map(function (_, k) {
      var b = doc.createElement("button");
      b.type = "button"; b.tabIndex = -1; b.setAttribute("aria-label", "Room " + (k + 1));
      b.addEventListener("click", function () { go(k); });
      dotsWrap.appendChild(b);
      return b;
    });
    $$(".flame", car).forEach(function (f) { f.style.backgroundImage = "url(" + stripURL(["flame1", "flame2", "flame3"]) + ")"; });

    function layout(drag) {
      var sw = slides[0].offsetWidth, gap = Math.round(sw * 0.08 + 16);
      slides.forEach(function (sl, k) {
        var r = ((k - i) % n + n) % n;
        if (r > n / 2) r -= n;
        var jump = sl._r !== undefined && Math.abs(sl._r - r) > 1;
        sl.style.transition = (drag !== undefined || jump) ? "none" : "";
        sl._r = r;
        sl.style.transform = "translateX(" + (r * (sw + gap) + (drag || 0)) + "px) scale(" + (r === 0 ? 1 : 0.86) + ")";
        sl.style.zIndex = r === 0 ? 2 : 1;
        sl.style.visibility = Math.abs(r) > 1 ? "hidden" : "";
      });
    }
    function go(k) {
      i = (k + n) % n;
      slides.forEach(function (s, j) {
        s.classList.toggle("is-active", j === i);
        s.setAttribute("aria-hidden", String(j !== i));
      });
      dots.forEach(function (d, j) { if (j === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      if (count) count.textContent = String(i + 1);
      layout();
    }
    $("[data-prev]", car).addEventListener("click", function () { go(i - 1); });
    $("[data-next]", car).addEventListener("click", function () { go(i + 1); });
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    });
    var sx = null, dx = 0;
    vp.addEventListener("pointerdown", function (e) { sx = e.clientX; dx = 0; });
    window.addEventListener("pointermove", function (e) { if (sx === null) return; dx = e.clientX - sx; layout(dx * 0.6); });
    function end() {
      if (sx === null) return;
      var moved = dx; sx = null; dx = 0;
      if (moved < -40) go(i + 1); else if (moved > 40) go(i - 1); else layout();
    }
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("resize", debounce(function () { layout(); }, 120));
    go(0);
  }

  /* ---------------------------------------------------------
     Inventory
     --------------------------------------------------------- */
  function initInventory() {
    var grid = $("[data-inventory]");
    if (!grid) return;
    var items = $$("li", grid);
    var nameEl = $("[data-inv-name]"), descEl = $("[data-inv-desc]");
    function cols() { return Math.max(1, Math.round(grid.clientWidth / (items[0].offsetWidth + 10))); }
    function select(k, focus) {
      items.forEach(function (it, j) { it.setAttribute("aria-selected", String(j === k)); it.tabIndex = j === k ? 0 : -1; });
      nameEl.textContent = items[k].getAttribute("data-name");
      descEl.textContent = items[k].getAttribute("data-desc");
      if (focus) items[k].focus();
    }
    items.forEach(function (it, k) {
      it.addEventListener("click", function () { select(k); });
      it.addEventListener("keydown", function (e) {
        var c = cols(), to = null;
        if (e.key === "ArrowRight") to = k + 1;
        if (e.key === "ArrowLeft") to = k - 1;
        if (e.key === "ArrowDown") to = k + c;
        if (e.key === "ArrowUp") to = k - c;
        if (e.key === "Home") to = 0;
        if (e.key === "End") to = items.length - 1;
        if (to !== null) { e.preventDefault(); select(clamp(to, 0, items.length - 1), true); }
      });
    });
  }

  /* ---------------------------------------------------------
     Campfire
     --------------------------------------------------------- */
  function initCampfire() {
    var cv = $(".campfire");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height, frame = 0, embers = [], raf = 0, last = 0, lastFlame = 0;
    var flames = ["flame1", "flame2", "flame3"];
    function paint(now) {
      ctx.clearRect(0, 0, W, H);
      /* glow on the ground */
      for (var y = H - 10; y < H; y++) for (var x = 4; x < W - 4; x++) {
        var d = Math.hypot((x - W / 2) / 16, (y - (H - 5)) / 5);
        if (d < 1 && (1 - d) * 0.8 > bayer(x, y)) { ctx.fillStyle = "#3a3016"; ctx.fillRect(x, y, 1, 1); }
      }
      /* stones */
      [[9, H - 5], [13, H - 3], [26, H - 3], [30, H - 5]].forEach(function (s) {
        ctx.fillStyle = "#9aa3a0"; ctx.fillRect(s[0], s[1], 3, 1); ctx.fillStyle = "#5d6866"; ctx.fillRect(s[0], s[1] + 1, 3, 1);
      });
      drawSprite(ctx, S.logs, 12, H - 10, 1);
      drawSprite(ctx, S[flames[frame]], 12, H - 28, 2);
      embers.forEach(function (e) {
        ctx.globalAlpha = Math.max(0, 1 - e.l / e.m);
        ctx.fillStyle = e.l < e.m * 0.4 ? "#f5c451" : "#e57f2e";
        ctx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
      });
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 40) return;
      var dt = (now - last) / 16.7; last = now;
      if (now - lastFlame > 140) { frame = (frame + 1) % 3; lastFlame = now; }
      if (Math.random() < 0.35) embers.push({ x: 18 + Math.random() * 6, y: H - 22, vx: (Math.random() - 0.5) * 0.25, l: 0, m: 40 + Math.random() * 40 });
      for (var k = embers.length - 1; k >= 0; k--) {
        var e = embers[k]; e.l += dt; e.y -= 0.35 * dt; e.x += e.vx * dt + Math.sin(e.l * 0.2) * 0.1;
        if (e.l > e.m) embers.splice(k, 1);
      }
      paint(now);
    }
    paint(0);
    if (RM || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(loop); }
      else { cancelAnimationFrame(raf); raf = 0; }
    }).observe(cv);
  }

  /* ---------------------------------------------------------
     The cat — an original desktop pet
     --------------------------------------------------------- */
  function initCat() {
    if (!S.catSit) return;
    var toggle = $(".hud__cat");
    var SC = 3, FW = 22, FH = 18; /* frame incl. 1px halo */
    var NAMES = ["catWalkA", "catWalkB", "catSit", "catBlink", "catGroomA", "catGroomB", "catSleepA", "catSleepB"];
    var frames = {};
    var basePal = PAL;
    function makeFrame(rows, flip, pal) {
      var c = doc.createElement("canvas");
      c.width = FW * SC; c.height = FH * SC;
      var x = c.getContext("2d");
      var w = rows[0].length, h = rows.length;
      var solid = function (cx, cy) { return cx >= 0 && cy >= 0 && cx < w && cy < h && rows[cy].charAt(cx) !== "."; };
      x.fillStyle = "rgba(244,234,208,.62)";
      for (var yy = -1; yy <= h; yy++) for (var xx = -1; xx <= w; xx++) {
        if (solid(xx, yy)) continue;
        var near = false;
        for (var oy = -1; oy <= 1 && !near; oy++) for (var ox = -1; ox <= 1; ox++) if ((ox || oy) && solid(xx + ox, yy + oy) && !(ox && oy)) { near = true; break; }
        if (near) { var fx = flip ? (w - 1 - xx) : xx; x.fillRect((fx + 1) * SC, (yy + 1) * SC, SC, SC); }
      }
      drawSprite(x, rows, SC, SC, SC, { flip: flip, pal: pal });
      return c;
    }
    function buildFrames(pal) {
      NAMES.forEach(function (n) { frames[n] = [makeFrame(S[n], false, pal), makeFrame(S[n], true, pal)]; });
    }
    buildFrames(basePal);

    var cv = doc.createElement("canvas");
    cv.className = "neko"; cv.width = FW * SC; cv.height = FH * SC; cv.setAttribute("aria-hidden", "true");
    doc.body.appendChild(cv);
    var ctx = cv.getContext("2d");

    var vw = window.innerWidth, vh = window.innerHeight;
    var touchy = window.matchMedia && matchMedia("(hover: none)").matches;
    var cat = {
      x: touchy ? vw - 52 : 70, y: vh - 10, mode: "sleep", face: 1, frame: "catSleepA",
      since: performance.now(), nextGroom: 0, lastAnim: 0, alt: false, nextBlink: 0
    };
    var target = { x: cat.x, y: cat.y }, pointer = { x: -1, y: -1, t: 0, moved: false };
    var enabled = true, raf = 0, last = 0, petting = false, lastPet = 0, lastZ = 0, drawn = "";
    var STOP = 26;

    try { if (localStorage.getItem("neko-off") === "1") enabled = false; } catch (e) { /* storage blocked */ }

    function rect() { return { l: cat.x - FW * SC / 2, t: cat.y - FH * SC + SC, r: cat.x + FW * SC / 2, b: cat.y + SC }; }
    function inside(px, py) { var r = rect(); return px >= r.l + 6 && px <= r.r - 6 && py >= r.t + 12 && py <= r.b; }
    function fx(text, cls, dx, dy) {
      var s = doc.createElement("span");
      s.className = "neko-fx" + (cls ? " " + cls : "");
      if (text) s.textContent = text;
      if (cls === "neko-fx--heart") s.style.backgroundImage = "url(" + spriteURL("heart") + ")";
      s.style.setProperty("--fx", Math.round(cat.x + (dx || 0)) + "px");
      s.style.setProperty("--fy", Math.round(cat.y - FH * SC + (dy || 0)) + "px");
      doc.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 1500);
    }
    function setMode(m) { if (cat.mode !== m) { cat.mode = m; cat.since = performance.now(); } }
    function paint(name) {
      var key = name + (cat.face < 0 ? "L" : "R");
      if (key !== drawn) {
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.drawImage(frames[name][cat.face < 0 ? 1 : 0], 0, 0);
        drawn = key;
      }
      cv.style.transform = "translate3d(" + Math.round(cat.x - FW * SC / 2) + "px," + Math.round(cat.y - FH * SC + SC) + "px,0)";
    }
    function pet() {
      lastPet = performance.now();
      fx("", "neko-fx--heart", -10 + Math.random() * 10, -4);
      if (Math.random() < 0.5) fx(["prrr", "mrrp!", "purr"][Math.floor(Math.random() * 3)], "", 12, -10);
      if (cat.mode === "sleep" || cat.mode === "walk") setMode("sit");
    }

    function update(now, dt) {
      var tx = target.x, ty = target.y;
      if (pointer.moved) {
        var side = cat.x < pointer.x ? -1 : 1;
        tx = clamp(pointer.x + side * 40, 34, vw - 34);
        ty = clamp(pointer.y + 30, 70, vh - 6);
      }
      var dx = tx - cat.x, dy = ty - cat.y, dist = Math.hypot(dx, dy);
      var idle = now - pointer.t;
      if (petting) dist = 0;

      switch (cat.mode) {
        case "sleep":
          cat.frame = (Math.floor(now / 900) % 2) ? "catSleepB" : "catSleepA";
          if (now - lastZ > 1700) { lastZ = now; fx("z", "", 10 * cat.face, 8); }
          if (dist > STOP + 70 && idle < 400 && !RM) { setMode("alert"); fx("!", "", 0, -6); }
          break;
        case "alert":
          cat.frame = "catSit";
          if (now - cat.since > 420) setMode("walk");
          break;
        case "walk":
          if (dist <= STOP) { setMode("sit"); cat.nextGroom = now + 2200 + Math.random() * 2600; break; }
          var run = dist > 240;
          var speed = (run ? 330 : 150) * dt / 1000;
          var stepLen = Math.min(speed, dist);
          cat.x += dx / dist * stepLen; cat.y += dy / dist * stepLen;
          if (Math.abs(dx) > 4) cat.face = dx < 0 ? -1 : 1;
          var period = run ? 90 : 150;
          cat.frame = (Math.floor(now / period) % 2) ? "catWalkB" : "catWalkA";
          break;
        case "sit":
          if (dist > STOP + 26) { setMode("walk"); break; }
          if (pointer.x >= 0) cat.face = pointer.x < cat.x ? -1 : 1;
          cat.frame = (now > cat.nextBlink && now < cat.nextBlink + 160) ? "catBlink" : "catSit";
          if (now > cat.nextBlink + 160) cat.nextBlink = now + 1800 + Math.random() * 2600;
          if (now > cat.nextGroom && !petting) setMode("groom");
          if (idle > 9000 && !petting) setMode("sleep");
          break;
        case "groom":
          if (dist > STOP + 26) { setMode("walk"); break; }
          cat.frame = (Math.floor(now / 260) % 2) ? "catGroomB" : "catGroomA";
          if (now - cat.since > 2600) { setMode("sit"); cat.nextGroom = now + 3500 + Math.random() * 4000; }
          break;
      }
      if (petting && now - lastPet > 900) pet();
      cat.x = clamp(cat.x, 30, vw - 30); cat.y = clamp(cat.y, 64, vh - 2);
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      var dt = Math.min(60, now - (last || now)); last = now;
      update(now, dt);
      paint(cat.frame);
    }
    function start() { if (!raf && enabled && !RM) { last = 0; raf = requestAnimationFrame(loop); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    function apply() {
      cv.style.display = enabled ? "" : "none";
      if (toggle) {
        toggle.setAttribute("aria-pressed", String(enabled));
        var st = $(".hud__cat-state", toggle); if (st) st.textContent = enabled ? "on" : "off";
        toggle.title = enabled ? "Cat companion: on (click to send her home)" : "Cat companion: off (click to call her back)";
      }
      if (enabled) { paint(cat.frame); start(); } else stop();
    }

    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); pointer.moved = true;
      petting = inside(e.clientX, e.clientY) && (cat.mode === "sit" || cat.mode === "groom" || cat.mode === "sleep");
    }, { passive: true });
    window.addEventListener("pointerdown", function (e) {
      if (!enabled) return;
      if (inside(e.clientX, e.clientY)) { pet(); return; }
      if (e.pointerType === "touch" && !RM) {
        pointer.moved = false;
        target.x = clamp(e.clientX, 34, vw - 34); target.y = clamp(e.clientY + 24, 70, vh - 6);
        pointer.t = performance.now(); pointer.x = e.clientX;
        if (cat.mode === "sleep") { setMode("alert"); fx("!", "", 0, -6); } else if (Math.hypot(target.x - cat.x, target.y - cat.y) > STOP + 26) setMode("walk");
      }
    }, { passive: true });
    doc.addEventListener("mouseleave", function () { petting = false; });
    window.addEventListener("resize", function () { vw = window.innerWidth; vh = window.innerHeight; if (!pointer.moved) { target.y = vh - 10; cat.y = Math.min(cat.y, vh - 2); } });
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) stop(); else start(); });

    if (toggle) toggle.addEventListener("click", function () {
      enabled = !enabled;
      try { localStorage.setItem("neko-off", enabled ? "0" : "1"); } catch (e) { /* ignore */ }
      apply();
      showBanner(enabled ? "Cat companion joined" : "Cat went home", enabled ? "Party update" : "Party update");
    });

    /* secret: the classic code paints her ginger */
    var code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], pos = 0, ginger = false;
    doc.addEventListener("keydown", function (e) {
      pos = (e.key === code[pos] || e.key.toLowerCase() === code[pos]) ? pos + 1 : (e.key === code[0] ? 1 : 0);
      if (pos === code.length) {
        pos = 0; ginger = !ginger;
        var pal = Object.assign({}, PAL, ginger ? { b: "#d9822b", d: "#a8561c", h: "#f0a85a" } : {});
        buildFrames(pal); drawn = ""; paint(cat.frame);
        showBanner(ginger ? "Ginger cat unlocked" : "Back to midnight fur", "Secret found");
      }
    });

    paint(cat.frame);
    apply();
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  safe(function () { paintSprites(doc); }, "sprites");
  safe(initTitle, "title");
  safe(function () {
    var hero = $("#heroScene");
    if (hero) Landscape(hero, { seed: 11, moonX: 0.74, houseX: 0.84, clearRight: true });
    var band = $("#cvScene");
    if (band) Landscape(band, { seed: 5, moonX: 0.6, moonY: 0.4, houseX: 0.9, horizon: 0.6 });
  }, "landscape");
  safe(initDialogue, "dialogue");
  safe(initPortraits, "portraits");
  safe(initNav, "nav");
  safe(initAnchors, "anchors");
  safe(initMap, "map");
  safe(initQuests, "quests");
  safe(initCarousel, "carousel");
  safe(initInventory, "inventory");
  safe(initCampfire, "campfire");
  safe(initWorld, "world");
  safe(initCat, "cat");
})();
