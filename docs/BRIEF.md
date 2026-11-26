# Portfolio variants — shared brief

We are building ~20 radically different, fully polished design variants of Sabrina's personal portfolio. The current site (navy/yellow "Midnight Companion", see `design/midnight-collaborative-review-v6.html` and `deploy/sabrina-portfolio/`) is functional but flat: no motion, weak typography, no vibe. Each variant must look like a site a top creative studio would ship — the kind that wins Awwwards / gets featured on godly.website / siteinspire. Anyone who opens it should be impressed.

## Who Sabrina is (her taste)

- Computer science graduate exploring AI and cybersecurity. Draws traditional art: portraits of people and anime/manga characters. Reads manga and manhwa.
- Loves **gothic** things, sometimes **cute** things, and **green**. Mood references: gothic whimsy / Tim Burton, Maggie Appleton's illustrated personal site, Clay.com (card stacks, scroll storytelling).
- Cats are welcome: animated cats, cute cats, weird cats — as original illustrations you draw in SVG/CSS/canvas.

## Content — use ONLY these facts (no invented projects, employers, dates, degrees, numbers, posts, testimonials)

Name: **Sabrina**. Profile picture: `../assets/pfp.jpg` (an anime-style portrait, 736×1308, face in upper ~45%; crop to face with `object-position` around `50% 25%`). It is her chosen avatar — do not label it as her artwork.

Tagline (her words): **"Computer science graduate exploring AI and cybersecurity."**

Hero greeting used so far: "Hi, I'm Sabrina." (you may restyle or rephrase the greeting itself, keep the tagline meaning).

Primary actions: "Explore my work" (→ #projects), "See my drawings" (→ #art).

**Projects** — one project so far:
- Label: Web developer internship. Title: "A clearer homepage". Summary: "Simpler content. Clearer navigation. Brand palette adopted by the team."
- The challenge: The homepage was text-heavy, cluttered, and difficult to navigate.
- My contribution: Sketched a low-fidelity wireframe on paper; simplified the writing; emphasized key actions; improved spacing and typography; developed a colour palette and brand guide.
- The result: The team redesigned the homepage and adopted the palette as official branding, updating the logo colours to match. The team was pleased.
- Company name, screenshots and metrics are NOT known — show a beautifully designed image slot clearly labelled as a placeholder ("Project image coming soon" or similar). Leave room for more projects later (e.g. a tasteful "More projects soon" slot).

**Art** — "Selected drawings. Portraits and characters, drawn on paper." Artwork is not supplied yet. Build a real carousel/gallery (prev/next buttons, position indicator, keyboard arrows, touch swipe) with 3–5 slots that are designed as elegant frames clearly labelled as placeholders (e.g. "Featured portrait — coming soon", "Character drawing — coming soon"). Never put generated illustrations inside these slots as if they were her art.

**Skills & direction** — make the names big and prominent, each with an accurate status label:
- Web Design — *In practice* (links to the project)
- AI Integrations — *Learning*
- AI Operations — *Learning*
- Aspiring Cybersecurity Analyst — *Career direction* (an aspiration, not a job title)
Other true strengths you may mention lightly: automations, creative problem solving, quick learning, communication.

**Blog** — no posts exist. Design a beautiful blog section with 1–3 clearly-marked future-post placeholder cards ("Coming soon", "First post in progress"). No invented titles that pretend to be published; generic placeholders like "Post title" or thematic "Notes on design, art & security — soon" are fine.

**CV** — a separate page `cv.html`: Experience: Web developer internship (company & dates to add) — homepage redesign and brand palette. Education: Computer science graduate (institution & date to add). Direction: AI Integrations & AI Operations (learning), Aspiring Cybersecurity Analyst. More about me: "I work on automations, draw, and read manga and manhwa." Link back to homepage sections. No download button for a CV file that doesn't exist (a "PDF coming soon" disabled state is OK).

**Contact**: no email/socials supplied. You may include a footer/contact area with a "Contact details coming soon" placeholder. Do not invent addresses or handles.

Decorative copy (section kickers, labels like "Chapter I", "Episode 01", "Specimen No. 3", UI microcopy, cat names) is free — just never make factual claims beyond the list above.

## Structure (locked by Sabrina)

One continuous vertical homepage: **Home → Projects → Art → Skills → Blog** (+ footer), nav links scroll to sections; **CV is the only separate page**. Your variant may express this structure in any visual way (chapters, panels, terminal commands, game levels…) but all sections and the CV page must exist and be navigable.

## Technical rules

- Your variant lives ONLY in its own folder `variants/NN-slug/`. Required: `index.html`, `cv.html`, `NOTES.md`. Optional: `style.css`, `main.js`, extra SVG files. Do not edit anything outside your folder.
- Static HTML/CSS/vanilla JS. It must work when opened straight from disk (`file://`): no local ES-module imports, no fetch of local files, no build step.
- External resources allowed: Google Fonts; scripts from `cdn.jsdelivr.net/npm/`, `cdnjs.cloudflare.com`, or `unpkg.com` pinned to exact versions, e.g. `gsap@3.12.5` (+ `ScrollTrigger`), `lenis@1.1.13`, `three@0.160.0` (UMD build `build/three.min.js`), `roughjs@4.6.6`, `split-type@0.3.4`, `animejs@3.2.2`. Page must still be readable if a CDN fails.
- Motion is required and should be the star: intro sequence, scroll-driven reveals, hover micro-interactions, cursor effects, animated SVG, kinetic type, etc. Respect `prefers-reduced-motion` (tone down to fades/no motion). Content must never stay permanently hidden if JS fails or a scroll observer doesn't fire.
- Responsive: excellent at 1440px desktop and at 390px phone width; no horizontal page scroll on mobile.
- Accessibility: semantic landmarks/headings, visible focus states, alt text, sufficient contrast, keyboard-operable carousel and nav.
- Original work only: no copyrighted characters, logos, or brand look-alikes. Cats and all illustrations are your own SVG/CSS/canvas creations.
- Avoid the generic "AI-made website" look: no default purple/blue gradients, no Inter-everywhere, no emoji as icons, no lorem ipsum, no cookie-cutter SaaS sections. Commit hard to the concept: distinctive typography pairings, a deliberate palette, custom details.

## Verify before you finish (mandatory)

1. `node variants/_tools/console.cjs variants/NN-slug` → fix every error/uncaught exception (repeat for `cv.html`).
2. `node variants/_tools/shoot.cjs variants/NN-slug` (and `... cv.html`) → writes PNGs into `variants/NN-slug/_shots/`. Open them with the Read tool and critically review: desktop first screen, full desktop, full mobile. Note: the screenshot is taken without scrolling, so scroll-triggered content may appear in its initial state in the tall shots — make sure reveals trigger when in the viewport on load, or confirm the initial state is intentional. Iterate on what looks weak, broken, overlapping, empty, or generic — at least two improvement rounds. Keep the final `_shots/` in the folder (they're used for the comparison gallery).
3. Write `NOTES.md`: concept name, one-line pitch, palette (hex), fonts, libraries, motion/interaction list, cats/easter eggs, what is placeholder, known limitations.

Do not git commit. Report back in ≤10 lines: folder, concept, highlights, any issues.
