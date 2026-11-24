# 11 · Pixel Neko Quest

**Pitch:** Sabrina's portfolio as a cozy 16-bit RPG: a moonlit pixel village, a world map of landmarks, a quest log, a gallery dungeon, a character sheet with an inventory, and an original pixel cat that follows your cursor like a desktop pet.

## Structure
- `index.html`: Village (hero + world map) → Quest Log (projects) → Gallery Dungeon (art) → Character Sheet (skills) → Notice Board (blog) → Campfire (footer)
- `cv.html`: "Save File", a load-game style CV page with fast-travel links back to every section
- `sprites.js`: every sprite as hand-written pixel strings (cat frames, landmarks, inventory items, icons, flames)
- `assets/avatar/`: Sabrina’s hand-pixelled avatar. `avatar.js` holds the sprites (`AVATAR_SPRITES`: 64×64 `base`, `blink`, `smile`, and a 32×32 `tiny`) in the same string format as `sprites.js`, with their own palette. `avatar-64.png` is the no-JS fallback.
- `main.js`: canvas scenes, the world painter, cat AI, dialogue typing, carousel, tabs, inventory, nav
- `style.css`: tokens, 9-slice pixel frames (inline SVG `border-image`), tiles (no-JS fallback), layouts

## One continuous world (refinement 1)
Below the hero, every area sits on one painted ground (`initWorld` in `main.js`): a single canvas behind the page from the world map to the campfire, drawn at the world map's 3px art pixel with the map's pine sprite, path colours and ink outline. The journey follows the map's order:
- **Village** grass around the world map → a **treeline** seam → **Quest Log** on the forest floor, pines filling the margins.
- **Cliff** seam: mossy boulder cliff with a cut-stone **cave arch** and a crystal keystone → **Gallery Dungeon** inside the cave (rubble floor, boulder walls in the margins, existing torches).
- **Stone steps** seam: the cave mouth opens onto steps that lighten towards the moonlight → **Character Sheet** in a moonlit clearing (dithered moon pool, moon-tinted pines).
- **Fence and gate** seam (lantern-capped gate posts, flower beds, a cottage in the right margin) → **Notice Board** on a cobbled village square flanked by two lamps.
- **Night treeline** seam → **Campfire** ground with a dithered firelight pool under the fire.
- The ground gets darker as you go deeper, apart from the moonlit clearing and lamp-lit square, so the scroll reads as one walk through the night.
- **The trail** from the world map continues down the left margin (dirt, flagstones in the cave, cut steps through rock) with a small clearing beside every area name. A sticky "You are here" marker (Sabrina’s 32px `tiny` sprite at 2x, with a cream outline) rides it at mid-screen. It only shows when the margin is at least about 100px wide (viewports of about 1380px and up); narrower screens keep the seams and biomes.
- Each area's `--seam` CSS variable sets the strip height. The painter reads it, so spacing and art stay in sync.
- `cv.html` (Save File) uses the same painter: the moonlit clearing dithers in from the hero's meadow, matching the Character Sheet.

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
| Crystal | `#69dccb` | save point, career-direction state, cave keystone |

World ground ramp (darker with depth): village `#1f4d2e` → forest `#1a412b` → cave `#122326` (boulders `#2e4447`/`#1b2c2f`) → moonlit clearing `#163b36` → village square `#22502f` (cobbles `#4a5646`) → camp `#11261f`. Trail dirt `#b89a5e`/`#6f5a32`, as on the map.

## Fonts
- **Silkscreen** for h1/h2 only (area names)
- **Pixelify Sans** for UI, dialogue, item and skill names
- **Atkinson Hyperlegible** for long reading text

## Libraries
None. Vanilla JS and canvas only, so the page runs from `file://` and has no CDN to fail. Only Google Fonts loads from outside, with system fallbacks.

## Motion & interaction
- Hero: a procedural parallax pixel landscape on canvas (dithered sky with Bayer ordered dithering, moon halo, twinkling stars, mountains, pine ridges, a cottage with chimney smoke and a flickering lamp, framing trees, a flower meadow). Layers shift with the mouse and scroll. Fireflies drift around and are pulled gently toward the cursor. Runs at a deliberate 30fps and pauses offscreen.
- Title letters drop in with stepped timing; the dialogue box rises, the tagline types out letter by letter (click or Enter skips), then the choice menu appears with a blinking ▶ cursor and a bobbing ▼ prompt that jumps to the world map.
- Party-member portrait: Sabrina’s hand-pixelled 64×64 avatar, drawn 1:1 on a canvas over a dithered parchment backdrop and shown only at whole-number scales (128px in the dialogue box and on the CV, 192px on the Character Sheet) with `image-rendering: pixelated`. She blinks every few seconds (sometimes twice) while on screen, and smiles while her box (dialogue box, character card, save slot) is hovered or has focus. The **HD** switch dissolves the sprite away in four ordered-dither steps to reveal the original `assets/pfp.jpg` (fetched only when the switch is first reached for), and dithers back. Pixel art is the default. Alt text follows what is shown: "pixel-art version of Sabrina’s avatar", or the picture’s description in HD; the Character Sheet copy is decorative (`alt=""`).
- World map: a procedurally drawn pixel map (meadow noise, lake, forests, dirt trail on a Catmull-Rom path with footprints). Landmarks are real links; they hop on hover or focus. Sabrina’s `tiny` sprite stands on the trail beside the current landmark as the party marker. It has a separate portrait layout for mobile.
- Quest Log: keyboard-accessible quest tabs (arrow keys). The objective checkboxes tick one by one when the list scrolls into view. A locked "unwritten quest" tab holds the "more projects soon" slot.
- Gallery Dungeon: a looping carousel with prev/next, gem position dots, a "Room n of 4" counter, arrow keys and swipe or drag. Torches flicker using 3-frame sprite-strip animation.
- Character Sheet: big skill names with quest-state chips (In practice: a blinking dot; Learning: cycling pips; Career direction: a diamond), plus an inventory grid with a roving tab index, arrow-key navigation, and a description window.
- Area banner ("Now entering · Gallery Dungeon") slides in as you scroll into each area, and the HUD menu cursor follows the active area.
- Campfire footer: a canvas fire with logs and rising embers.
- The world ground is painted once, never animated. The first paint waits for web fonts and an idle moment (`requestIdleCallback`), so it never lands on the intro. It repaints only when the layout changes (`ResizeObserver`, debounced). The "You are here" pin uses CSS `position: sticky`, so it needs no scroll handler.

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
Skip link, landmarks, one h1 per page, a visible lantern-yellow focus ring, ARIA tabs and listbox patterns, screen-reader copies of typed text, and decorative canvases marked `aria-hidden`. With `prefers-reduced-motion`, the scene is drawn once without animation, text appears without typing, the cat stays asleep (petting still works), the avatar doesn’t blink and HD switches instantly, and the carousel slides without animation. With no JS the content stays fully visible: the avatar PNG shows, the map nodes become a list, and the carousel becomes a scroll-snap strip.

## Known limitations
- The cat lives in viewport space (`position: fixed`). In full-page screenshots she shows up wherever the viewport bottom was at capture time.
- Silkscreen is a caps-style face, so it is limited to area headings.
- The world paint is a one-off main-thread task of about 50 to 130ms in headless Chrome (about 1M art pixels at 1440). It runs at idle and again only on layout change. Without JS, the per-area CSS tiles and edges remain as a simpler fallback.
