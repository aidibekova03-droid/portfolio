# 11 · Pixel Neko Quest

**Pitch:** Sabrina's portfolio as a cozy 16-bit RPG: a moonlit pixel village, a world map of landmarks, a quest log, a gallery dungeon, a character sheet with an inventory, and an original pixel cat that follows your cursor like a desktop pet.

## Structure
- `index.html`: Village (hero + world map) → Quest Log (projects) → Gallery Dungeon (art) → Character Sheet (skills) → Notice Board (blog) → Campfire (footer)
- `cv.html`: "Save File", a load-game style CV page with fast-travel links back to every section
- `sprites.js`: every sprite as hand-written pixel strings (cat frames, landmarks, inventory items, icons, flames)
- `main.js`: canvas scenes, cat AI, dialogue typing, carousel, tabs, inventory, nav
- `style.css`: tokens, 9-slice pixel frames (inline SVG `border-image`), tiles, layouts

## Palette
| Token | Hex | Use |
|---|---|---|
| Night | `#0b1d22` | page base, footer |
| Night teal | `#0e2a30` | sky, dark windows, Character Sheet |
| Pine | `#1f4d2e` | grass, map area |
| Leaf | `#62a447` | collar, checks, list markers |
| Moss | `#b9d86a` | kicker text |
| Lantern | `#f5c451` | highlights, active states, gold frames |
| Cream | `#f4ead0` | text boxes, body text on dark |
| Parchment | `#d6c49a` | box shading |
| Wood | `#6b4423` / `#3b2618` | Quest Log floor, notice board |
| Berry | `#c4503f` | menu cursor, stamps, pins |
| Crystal | `#69dccb` | save point, career-direction state |

## Fonts
- **Silkscreen** for h1/h2 only (area names)
- **Pixelify Sans** for UI, dialogue, item and skill names
- **Atkinson Hyperlegible** for long reading text

## Libraries
None. Vanilla JS and canvas only, so the page runs from `file://` and has no CDN to fail. Only Google Fonts loads from outside, with system fallbacks.

## Motion & interaction
- Hero: a procedural parallax pixel landscape on canvas (dithered sky with Bayer ordered dithering, moon halo, twinkling stars, mountains, pine ridges, a cottage with chimney smoke and a flickering lamp, framing trees, a flower meadow). Layers shift with the mouse and scroll. Fireflies drift around and are pulled gently toward the cursor. Runs at a deliberate 30fps and pauses offscreen.
- Title letters drop in with stepped timing; the dialogue box rises, the tagline types out letter by letter (click or Enter skips), then the choice menu appears with a blinking ▶ cursor and a bobbing ▼ prompt that jumps to the world map.
- Party-member portrait: the profile picture is drawn pixelated (36px) on canvas. The **HD** switch "upscales" it through 48→72→108→full resolution steps, and back again.
- World map: a procedurally drawn pixel map (meadow noise, lake, forests, dirt trail on a Catmull-Rom path with footprints). Landmarks are real links; they hop on hover or focus. It has a separate portrait layout for mobile.
- Quest Log: keyboard-accessible quest tabs (arrow keys). The objective checkboxes tick one by one when the list scrolls into view. A locked "unwritten quest" tab holds the "more projects soon" slot.
- Gallery Dungeon: a looping carousel with prev/next, gem position dots, a "Room n of 4" counter, arrow keys and swipe or drag. Torches flicker using 3-frame sprite-strip animation.
- Character Sheet: big skill names with quest-state chips (In practice: a blinking dot; Learning: cycling pips; Career direction: a diamond), plus an inventory grid with a roving tab index, arrow-key navigation, and a description window.
- Area banner ("Now entering · Gallery Dungeon") slides in as you scroll into each area, and the HUD menu cursor follows the active area.
- Campfire footer: a canvas fire with logs and rising embers.

## The cat
An original tuxedo cat, drawn from my own sprite data with midnight fur, green eyes and a green collar with a lantern bell. A cream halo keeps her readable on dark backgrounds.
- Starts asleep at the bottom of the screen with floating "z"s.
- When the cursor moves she wakes ("!"), walks after it, and runs when it's far away. She stops beside the cursor rather than on top of it, so she never covers links.
- Once she catches up she sits and blinks, grooms her paw after a while, and falls back asleep after about 9 seconds of idle.
- Hover over or click her to pet her: pixel hearts and "prrr".
- On touch devices she walks to wherever you tap.
- The HUD paw button turns her on or off, and the choice is remembered.
- **Easter egg:** the Konami code (↑↑↓↓←→←→BA) turns her ginger.

## Placeholders (clearly labelled)
- Project image: "Project image coming soon"
- 4 gallery frames: "Featured portrait / Character drawing / Portrait study / Character sketch", each marked "coming soon" and "Placeholder frame. Artwork not yet hung."
- 3 notice-board cards: "First post in progress", "Coming soon"; no invented post titles
- Contact: "Contact details coming soon"
- CV: company, dates and institution "to be added"; disabled "PDF coming soon" button

## Accessibility
Skip link, landmarks, one h1 per page, a visible lantern-yellow focus ring, ARIA tabs and listbox patterns, screen-reader copies of typed text, and decorative canvases marked `aria-hidden`. With `prefers-reduced-motion`, the scene is drawn once without animation, text appears without typing, the cat stays asleep (petting still works), and the carousel slides without animation. With no JS the content stays fully visible: the plain image shows, the map nodes become a list, and the carousel becomes a scroll-snap strip.

## Known limitations
- The pixelated portrait can't be colour-quantised, because canvas pixels can't be read under `file://` (tainted canvas). It is downsampled only, and a cream multiply blend replaces the white background.
- The cat lives in viewport space (`position: fixed`). In full-page screenshots she shows up wherever the viewport bottom was at capture time.
- Silkscreen is a caps-style face, so it is limited to area headings.
