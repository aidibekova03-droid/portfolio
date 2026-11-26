# Sabrina's portfolio

**Pixel Neko Quest** is the active design: Sabrina's portfolio as a cozy 16-bit RPG, with a moonlit pixel village, a world map, a quest log, a gallery dungeon, a character sheet and a pixel cat that follows your cursor. One scrolling homepage covers Home, Projects, Art, Skills and Blog, and the CV is a separate "Save File" page. Artwork, project screenshots and formal CV details are still being collected and are clearly labelled placeholders.

## Edit and check

The site source is `site/` (static HTML, CSS and vanilla JS; no npm dependencies). Open `site/index.html` directly in a browser to preview it.

```powershell
node scripts/build-site.cjs          # copies site/ to deploy/sabrina-portfolio/
node tools/shoot.cjs site            # 1440px + true 390px screenshots, console errors
node tools/shoot.cjs site cv.html
```

Screenshots land in `site/_shots/` (ignored by git). `site/NOTES.md` documents the palette, fonts, motion, the cat and every placeholder.

## Versions

Refinements are committed one at a time on the `pixel-neko` branch so any of them can be reverted. The tag `pixel-neko-v1-baseline` is the design as originally chosen, and `pixel-neko-v2` is the version after the first round of refinements:

```powershell
git log --oneline pixel-neko-v1-baseline..   # list refinements since the baseline
git revert <commit>                           # undo one refinement
git switch --detach pixel-neko-v1-baseline    # look at the original
```

## Deployment

`vercel.json` runs `node scripts/build-site.cjs` and serves `deploy/sabrina-portfolio`. The preview is marked `noindex` while content is placeholder. The older Midnight Companion design and its export scripts (`design/`, `scripts/export-preview.cjs`) are kept for history.

## Collaboration and content

Read `AGENTS.md` for confirmed facts and decisions, and `docs/BRIEF.md` for the content rules every design follows. Never invent projects, employers, dates, links or metrics. The cats and illustrations are drawn in code and are not Sabrina's artwork. `docs/RESEARCH.md` lists design tooling worth using. Other explored designs are parked in the private repo `saqlainartaz/sabrina-portfolio-variants`.
