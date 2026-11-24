# Research: tools and workflows for distinctive, award-level UI with Claude (Opus)

Compiled 2026-11-24. Star counts were read from the GitHub repo pages on that date unless marked otherwise. Third-party star figures varied a lot, so only the repo-page numbers are used here. Most repo pages did not show a last-commit date. "Active" means it has thousands of commits and is cited in 2026 coverage.

**Status key**
- **INSTALLED**: already on this machine (`~/.claude/skills`, the plugins list, or MCP config).
- **NEW**: not installed. Nothing was installed for this report.
- **(?)**: only partly verified.

**The main finding.** Several 2026 reviews tested design skills and reached the same result: telling Claude "don't make AI slop" doesn't work on its own. Three things do:
1. **A concrete reference** to aim at: real sites, a moodboard, or generated reference images.
2. **Named bans**: specific anti-patterns to avoid, such as purple gradients, Inter, and four cards in a grid.
3. **A browser feedback loop**: screenshot, critique, fix.

Don't run more than about 3 overlapping design skills at once, because their rules conflict.

---

## Ranked shortlist

| # | Name | Status | Stars | Category |
|---|---|---|---|---|
| 1 | Taste Skill | NEW | 120.7k | Design skill |
| 2 | Impeccable | INSTALLED | 115.7k | Design skill + slop detector |
| 3 | Hallmark | NEW | 60.1k | Design skill (themes) |
| 4 | Emil Kowalski skills | NEW | 59.1k | Motion skill |
| 5 | Meng To Skills | NEW | 8.1k | WebGL / GSAP / shader recipes |
| 6 | GSAP (free plugins) + official GSAP skills | INSTALLED (skills) | 19.0k (skills) | Animation |
| 7 | Lenis | lib (CDN) | 17.4k | Smooth scroll |
| 8 | Playwright MCP / Chrome DevTools MCP | NEW | 40.1k / 59.0k | Visual verification |
| 9 | Paper Shaders | lib | 4.0k | Shaders / grain / gradients |
| 10 | frontend-design (Anthropic) | INSTALLED | 199.5k (anthropics/skills) | Baseline skill |
| 11 | ui-ux-pro-max | INSTALLED | 153.3k | Palettes / fonts database |
| 12 | React Bits | lib (Next.js phase) | 52.6k | Animated components |
| 13 | shadcn MCP + registries (Aceternity, Magic UI, coss) | INSTALLED (MCP, failed to connect) | Magic UI 23.5k | Components |
| 14 | Image/asset generation MCPs (Nano Banana, Higgsfield, Recraft) | partly present | varies | Assets |
| 15 | Rive / Unicorn Studio / Spline | SaaS | n/a | No-code motion and 3D |
| + | Inspiration: recent.design (ex-Godly), Awwwards, siteinspire, Land-book, Codrops | sites | n/a | References |

---

### 1. Taste Skill (Leonxlnx) — NEW
- **URL:** https://github.com/Leonxlnx/taste-skill (120.7k stars, 324 commits)
- **What it does:** An anti-slop frontend skill (`design-taste-frontend`).
  - It covers art direction, reference images, and a real-browser check.
  - It tunes each build with "dials" for variance, motion and density.
  - Extra skills live in sibling repos:
    - `taste-skill-classics`: high-end-visual-design, minimalist-ui, industrial-brutalist-ui and others.
    - `imagegen-skills`: imagegen-frontend-web, brandkit, image-to-code.
- **Why it matters here:** It is the most-cited skill for portfolio and landing-page work. Its reference-image-first workflow is the fix the 2026 tests point to.
- **Install:** `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`
  - Or as a plugin: `/plugin marketplace add Leonxlnx/taste-skill`

### 2. Impeccable (Paul Bakaus) — INSTALLED
- **URL:** https://github.com/pbakaus/impeccable (115.7k stars, 3,795 commits)
- **What it does:** 24 commands plus a 62-rule deterministic slop detector. You can run the detector in CI or as a browser extension.
  - **Steer:** `bolder`, `colorize`, `typeset`, `animate`, `delight`, `overdrive`
  - **Review:** `critique`, `audit`
  - **Finish:** `polish`, `harden`
  - **Iterate live:** `live` (a browser overlay with variants)
  - **Set up:** `document`, which writes DESIGN.md
- **Why it matters here:** It is the best quality-control pass for all 23 variants. Run `critique` and the detector on each one, then `overdrive` or `delight` on the finalists.
- **Install:** already installed. To update: `npx impeccable update`.

### 3. Hallmark (Nutlope) — NEW
- **URL:** https://github.com/Nutlope/hallmark (60.1k stars; on GitHub Trending Jul–Oct 2026)
- **What it does:**
  - Sends a brief to one of four genres: editorial, modern-minimal, atmospheric or playful.
  - Then picks one of 50 material-like themes, such as Dusk, Atelier, Ribbon and Hedgerow.
  - `hallmark audit` scores existing code and gives a punch list without editing anything.
- **Why it matters here:** The "atmospheric" and "playful" genres map onto the gothic and cute directions. The audit is a second, independent slop check alongside Impeccable. (?) I couldn't confirm a theme that is specifically gothic. The full catalog is at usehallmark.com.
- **Install:** `npx skills add nutlope/hallmark -g`

### 4. Emil Kowalski skills — NEW
- **URL:** https://github.com/emilkowalski/skills (59.1k stars)
- **What it does:** 19 motion-craft skills from the author's work at Vercel and Linear, including:
  - `emil-design-eng`, `animate`, `choreograph`
  - `review-animations`, `improve-animations`, `animation-performance`
  - `find-animation-opportunities`
  - `learn-taste`, which turns your corrections into rules in DESIGN.md
- **Why it matters here:** The brief says "motion is the star". This set is the best source of easing, duration and choreography rules. It turns "cool but janky" into "polished".
- **Install:** `npx skills@latest add emilkowalski/skills`

### 5. Meng To Skills — NEW
- **URL:** https://github.com/MengTo/Skills (8.1k stars)
- **What it does:** 120+ recipe skills for creative-web effects:
  - **Three.js and WebGL:** `build-threejs-scroll-worlds`, `webgl-3d-object`
  - **Scroll motion:** `cinematic-gsap-lenis-motion-system`, `gsap-scrolltrigger-storytelling`
  - **Shader effects:** `add-shader-cursor-trail`, `shaders-cursor-ripples`, `dither-background`, `dither-ascii-ink-hover`, `fire-paper-loader`, `paper-cinder-transition`
  - **CSS treatments:** `progressive-blur`
  - **Tool guidance:** Unicorn Studio
- **Why it matters here:** These are the exact "YouTube wow" effects. Dither, ink hover and paper-burn transitions fit the gothic/manga mood (screentone and ink).
- **Install:** No CLI is given. Each skill is a plain `SKILL.md` folder: copy the ones you want into `~/.claude/skills/`. (?) `npx skills add MengTo/Skills` probably works but wasn't verified.

### 6. GSAP 3.13+ (all plugins now free) + official GSAP skills — skills INSTALLED
- **URLs:**
  - https://github.com/greensock/GSAP
  - https://github.com/greensock/gsap-skills (19.0k stars)
- **What changed:**
  - Webflow made GSAP 100% free, effective 2025-04-30. That includes the former Club plugins: **SplitText** (rewritten in 3.13), **MorphSVG**, DrawSVG, ScrollSmoother, Inertia and others.
  - They now ship in the standard `gsap` npm package and on CDNs. `gsap-trial` is deprecated.
- **Why it matters here:** You get kinetic type (SplitText), ink-stroke drawing (DrawSVG) and morphing cat and sigil SVGs (MorphSVG) with no license cost.
- **Action:** `BRIEF.md` pins `gsap@3.12.5`. Bump it to **3.13.0 or later** so the free plugins load from jsDelivr (e.g. `gsap@3.13.0/dist/SplitText.min.js`).
- **Installed skills:** all 8 are present in `~/.claude/skills`: core, timeline, scrolltrigger, plugins, utils, react, performance, frameworks.

### 7. Lenis (darkroom.engineering) — library
- **URL:** https://github.com/darkroomengineering/lenis (17.4k stars)
- **What it does:** A lightweight smooth scroll library. It is the standard scroll layer on Awwwards-style sites and pairs with ScrollTrigger.
- **Why it matters here:** It works with `file://` and plain CDN scripts.
- **Install:** Load from unpkg:
  - `https://unpkg.com/lenis@1.3.28/dist/lenis.min.js`
  - `https://unpkg.com/lenis@1.3.28/dist/lenis.css`
  - The brief's `1.1.13` also works. Next.js later: `npm i lenis`.

### 8. Visual verification MCPs — NEW (claude-in-chrome already available)
- **Playwright MCP**
  - URL: https://github.com/microsoft/playwright-mcp (40.1k stars)
  - Install: `claude mcp add playwright npx @playwright/mcp@latest`
- **Chrome DevTools MCP**
  - URL: https://github.com/ChromeDevTools/chrome-devtools-mcp (59.0k stars)
  - What it adds: screenshots plus **performance traces**, useful for checking animation frame rate.
  - Install: `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`, then `/plugin install chrome-devtools-mcp@chrome-devtools-plugins`
- **Why it matters here:** A screenshot → critique → fix loop is the biggest quality jump. Check each variant at 1440px and 390px, with reduced motion on, before calling it done.
- **Note:** the claude-in-chrome tools already work in this environment and can do the screenshot loop today.

### 9. Paper Shaders (paper.design) — library
- **URL:** https://github.com/paper-design/shaders (4.0k stars)
- **What it does:** Zero-dependency WebGL shaders such as mesh gradient, dot orbit, grain, dithering and halftone-style effects.
  - Vanilla: `@paper-design/shaders`
  - React: `@paper-design/shaders-react`
- **Why it matters here:** Atmospheric green-and-black mesh gradients and grain without writing GLSL. Dither and halftone effects read as manga screentone.
- **Install:** `npm i @paper-design/shaders` (vanilla) or `npm i @paper-design/shaders-react`. Pin the exact version, because breaking changes ship under 0.0.x.
  - (?) For static pages, import the ESM build from jsDelivr. A remote `type="module"` import should work over `file://`, but test it.

### 10. frontend-design (Anthropic) — INSTALLED
- **URLs:**
  - https://github.com/anthropics/skills (199.5k stars)
  - Installed as plugin `frontend-design@claude-plugins-official` v1.1.1
- **What it does:** The baseline anti-generic skill. It bans overused fonts and pushes Claude to commit to a bold aesthetic direction.
- **Why it matters here:** Keep it as the default entry point. Layer Taste or Hallmark on top for art direction.

### 11. ui-ux-pro-max — INSTALLED
- **URL:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (153.3k stars)
- **What it does:** A searchable database of 67 styles, 161 palettes and 57 font pairings.
- **Why it matters here:** Good for quickly pulling green and gothic palettes and serif/display font pairings.
- **Caveat:** reviewers say it is "kitchen-sink" with a heavy context footprint. Use it for lookups, not as the lead skill.

### 12. React Bits — library (Next.js phase)
- **URL:** https://github.com/DavidHDev/react-bits (52.6k stars, 1,712 commits)
- **What it does:** 215+ animated components and backgrounds, each in JS or TS and styled with CSS or Tailwind. Examples:
  - SplitText, text effects, cursor effects
  - Backgrounds: Silk, Threads, Aurora, Galaxy
- **Why it matters here:**
  - **Now:** a catalog of ideas you can ask Claude to port to vanilla JS.
  - **Later:** drop-in components for the Next.js version.
- **Install:** `npx shadcn@latest add @react-bits/SplitText-TS-TW` or `npx jsrepo@latest add https://reactbits.dev/r/<Component>-JS-CSS`

### 13. shadcn MCP + creative registries — MCP INSTALLED (failed to connect this session)
- **URL:** https://ui.shadcn.com/docs/mcp
- **What it does:** Lets Claude search and install from any shadcn-spec registry.
- **Registries worth adding to `components.json` for the Next.js phase:**
  - **Aceternity UI:** `"@aceternity": "https://ui.aceternity.com/registry/{name}.json"`. Needs React 19; some components need a Pro token.
  - **Magic UI:** https://github.com/magicuidesign/magicui (23.5k stars)
  - **React Bits:** `@react-bits`
  - **coss ui:** `@coss`. Origin UI was rebranded as coss ui; the old Origin components are in maintenance mode.
- **Also worth knowing:**
  - **Motion Primitives:** https://github.com/ibelick/motion-primitives (7.0k stars)
  - **Animate UI:** https://github.com/imskyleen/animate-ui (5.1k stars). Install with `npx @animate-ui/cli@latest animate all`.
- **Setup:** `npx shadcn@latest mcp init --client claude`. The `shadcn` MCP entry exists in `~/.claude.json` but timed out this session, so re-check it with `/mcp`.
- **21st MCP (formerly Magic MCP) — NEW**
  - URL: https://github.com/21st-dev/magic-mcp (6.7k stars)
  - What it does: searches and generates React/Tailwind components from 21st.dev.
  - Install: `npx @21st-dev/cli@latest init --client claude`. Needs a free API key from 21st.dev/mcp. Old Magic keys were reset.
  - Mainly useful for Next.js; most output is SaaS-flavoured, so curate it.

### 14. Image and asset generation (pair with Opus) — partly present
- **Higgsfield MCP**
  - Status: the claude.ai connector is configured but needs re-auth.
  - URL: `https://mcp.higgsfield.ai/mcp`. Needs a paid Higgsfield plan.
  - Use: the viral "cinematic scroll site" workflow, where generated video frames are scrubbed by GSAP ScrollTrigger and Lenis.
  - Tip from tutorials: plan first ("do not generate assets yet"), then spend credits.
- **Nano Banana (Gemini image) MCP — NEW**
  - URL: https://github.com/ConechoAI/nano-banana-mcp (240 stars)
  - Setup: run `npx nano-banana-mcp` with `GEMINI_API_KEY`.
  - Use: moodboards, textures, background plates.
  - (?) Several alternatives exist, such as `zhongweili/nanobanana-mcp-server` (Nano Banana 2) and `mrafaeldie12/nano-banana-pro-mcp`. They weren't star-verified.
- **Recraft remote MCP — NEW**
  - Install: `claude mcp add --transport http recraft https://mcp.recraft.ai/mcp`
  - What it does: vector/SVG generation and `vectorize_image`.
  - Use: turning sketches into clean SVG ornaments such as lace, thorns, vines and sigils. The old npm server is archived.
- **Figma MCP**
  - Status: the claude.ai connector is present but needs auth.
  - Install: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
  - Use: only if you design in Figma first.
- **Brief rule:** generated imagery is fine for textures, moodboards and decoration. It must never fill the art carousel slots as if it were Sabrina's drawing.

### 15. Rive / Unicorn Studio / Spline — no-code motion and 3D (SaaS)
- **Rive** (rive.app)
  - What it does: state-machine 2D animation with an MIT-licensed web runtime.
  - Use: the best fit for an **interactive mascot cat** that reacts to the cursor or clicks.
- **Unicorn Studio** (unicorn.studio)
  - What it does: a no-code WebGL effects editor with 90+ effects and an embed SDK that works in plain HTML.
  - Cost: the free plan adds a logo and excludes commercial use and code export. The "Legend" plan is about $18/mo.
  - Meng To has a skill for it.
- **Spline**
  - What it does: browser-based 3D scenes with web embeds.
  - Use: good for a 3D centerpiece; weaker for state-driven UI animation.
- **Lower priority:**
  - **OGL** (https://github.com/oframe/ogl, 4.8k stars): a minimal WebGL library.
  - **Theatre.js** (https://github.com/theatre-js/theatre, 13.1k stars): (?) v1.0 development moved to a private repo, so the public repo may lag.

### + Inspiration sources (feed these to Claude as references)
- **recent.design** (godly.website now 301-redirects here: the Godly gallery, rebranded): the best "wow" site gallery.
- **Awwwards** (awwwards.com): filter by illustration, interaction design, or the colour `#008751` for greens.
- **siteinspire**: minimal and typographic sites.
- **Land-book**: strictly curated landing pages.
- **Mobbin**: app UI patterns. Less relevant for a portfolio.
- **Codrops** (tympanus.net/codrops): the best source of *technique* tutorials with code. 2026 examples include scroll-driven WebGL galleries, GSAP kinetic typography "ghost trails", SVG-mask fullscreen transitions, and "WebGL for Designers".

---

## Recommended stack

**Skills.** Keep it to 3 active at once:
1. **Taste Skill** (NEW) or **Hallmark** (NEW) for art direction. Pick one.
2. **Impeccable** (installed) for `critique`, `audit` and `polish` passes.
3. **Emil Kowalski skills** (NEW) for motion polish.

Also use:
- The installed **GSAP skills** whenever you write animation code.
- **Meng To** recipes, picked one at a time for specific effects (dither, ink hover, paper-burn).

**Static HTML now (CDN, `file://`-safe):**
- GSAP **3.13+** with ScrollTrigger, SplitText, DrawSVG and MorphSVG (all free now).
- Lenis 1.3.x.
- Paper Shaders (vanilla) or hand-written GLSL for grain, dither and mesh-gradient atmosphere.
- Optionally Three.js or OGL for one 3D moment.
- Optionally a Rive cat.

**Next.js later:**
- shadcn + registries: `@aceternity`, `@magicui`, `@react-bits`, `@coss`.
- Motion (framer-motion), plus `useGSAP` from the installed gsap-react skill.
- Lenis (React).
- `@paper-design/shaders-react`.

**Assets:**
- Nano Banana or Higgsfield for moodboards, textures and hero plates.
- Recraft to vectorize ornaments into SVG.
- Never use generated images in place of Sabrina's art.

**Workflow loop** (what the YouTube "cool sites with Opus" builds actually do):
1. Collect 3–5 references from recent.design, Awwwards and Codrops.
2. Write DESIGN.md with `/impeccable document` (or Taste art direction): palette, type pair, motion rules.
3. Build.
4. Check in a real browser with claude-in-chrome or Playwright/Chrome DevTools MCP at 1440px and 390px, with reduced motion on.
5. Run `/impeccable critique` and `/hallmark audit`.
6. Run `/impeccable polish` and `/overdrive` on the finalists.
7. Repeat.

**Sources:** the GitHub repo pages listed above; snyk.io, bitdoze.com and composio.dev design-skill roundups; webflow.com/blog/gsap-becomes-free; gsap.com/community/standard-license; ui.shadcn.com/docs/mcp; ui.aceternity.com/docs/cli; coss.com/ui; higgsfield.ai help center; unicorn.studio/docs; rive.app/docs; tympanus.net/codrops.
