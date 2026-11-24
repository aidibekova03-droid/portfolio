# 11 · Pixel Neko Quest

**Pitch:** Sabrina's portfolio as a cozy 16-bit RPG: a moonlit pixel village, a world map of landmarks, a quest log, a gallery dungeon, a character sheet with an inventory, and an original pixel cat that follows your cursor like a desktop pet.

## Structure
- `index.html`: Village (hero + world map) → Quest Log (projects) → Gallery Dungeon (art) → Character Sheet (skills) → Notice Board (blog) → Campfire (footer)
- `cv.html`: "Save File", a load-game style CV page with fast-travel links back to every section
- `sprites.js`: every sprite as hand-written pixel strings (cat frames incl. the paw-swat `catBatA/B`, landmarks, inventory items, icons, flames, the toy mouse and pebble she knocks off ledges, the HUD speaker icons)
- `assets/avatar/`: Sabrina’s hand-pixelled avatar. `avatar.js` holds the sprites (`AVATAR_SPRITES`: 64×64 `base`, `blink`, `smile`, and a 32×32 `tiny`) in the same string format as `sprites.js`, with their own palette. `avatar-64.png` is the no-JS fallback.
- `main.js`: canvas scenes, the world painter, cat AI, dialogue typing, carousel, tabs, inventory, nav
- `style.css`: tokens, 9-slice pixel frames (inline SVG `border-image`), tiles (no-JS fallback), layouts
- `assets/favicon.svg`: the HUD's pixel cat head (`catHead` sprite) with a cream halo, so it reads on light and dark tab strips. Both pages also carry a description, `theme-color` and Open Graph title/description (no image); `noindex` stays.

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

## Polish pass (refinement 4)
- Fixed a 14 to 23px sideways scroll at 768 to 1280px: the Gallery Dungeon torch glow spilled past the viewport; the dungeon area now clips it (`overflow-x: clip`). Swept 360 to 1920px on both pages: no overflow.
- Mobile carousel controls: counter and gems on one row, Prev/Next side by side (Next used to wrap alone).
- CV cards sit in two stacked columns (Experience + Education, Direction + More about me), so the short Education card no longer leaves a hole.
- Copy: typographic apostrophes, inventory descriptions all in first person, the credits line no longer claims "every pixel" is drawn in code (the HD portrait is a picture).

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
- **Fast travel:** picking a landmark (click, tap, or Enter on the focused link) walks the party marker along the trail to it (at most 0.75s), leaving a fading line of footprints, then a pixel iris closes on her, a "Travelling to …" plate names the destination, the page jumps there and the iris opens again (about 1.5s in all). Focus moves to the destination area and the URL hash updates. The Save File landmark closes the iris and opens `cv.html`. With reduced motion it is an instant jump. When you scroll around the world with the map out of sight, the marker moves to the landmark of the area you are in.
- Quest Log: keyboard-accessible quest tabs (arrow keys). The objective checkboxes tick one by one when the list scrolls into view (40% visible); when the last one ticks, a pixel "Quest complete · A clearer homepage" toast slides up in the corner for about 3 seconds (decorative, `aria-hidden`; the panel already says the quest is complete). A locked "unwritten quest" tab holds the "more projects soon" slot.
- Gallery Dungeon: a looping carousel with prev/next, gem position dots, a "Room n of 4" counter, arrow keys and swipe or drag. Torches flicker using 3-frame sprite-strip animation.
- Character Sheet: big skill names with quest-state chips (In practice: a blinking dot; Learning: cycling pips; Career direction: a diamond), plus an inventory grid with a roving tab index, arrow-key navigation, and a description window.
- Area banner ("Now entering · Gallery Dungeon") slides in as you scroll into each area, the area's sign icon gives a single hop, and the HUD menu cursor follows the active area.
- Pixel controls (buttons, HUD toggles, choices, quest tabs, map landmarks, inventory items) sink by 2px while pressed.
- HUD: below 1300px the nav icons and the toggles' "on/off" words hide (the icons carry the state); the Map menu takes over at 980px and below.
- Campfire footer: a canvas fire with logs and rising embers.
- The world ground is painted once, never animated. The first paint waits for web fonts and an idle moment (`requestIdleCallback`), so it never lands on the intro. All layout reads happen up front; the ground is then filled in ~12ms idle slices and the features, cave and commit each run as their own idle task, so no world task is a long task. The old canvas stays up until the new one commits. It repaints only when the layout changes (`ResizeObserver`, debounced). The "You are here" pin uses CSS `position: sticky`, so it needs no scroll handler.
- Loops pause when unseen: the hero scene and campfire stop their `requestAnimationFrame` off screen and in hidden tabs; looping CSS sprites (torches, skill chips, blinking cursors) pause via an `is-offscreen` class on their area; the cat only writes her transform when she moves.

## The cat
An original tuxedo cat, drawn from my own sprite data with midnight fur, green eyes and a green collar with a lantern bell. A cream halo keeps her readable on dark backgrounds.
- Starts asleep at the bottom of the screen with floating "z"s.
- When the cursor moves she wakes ("!"), walks after it, and runs when it's far away. She stops beside the cursor rather than on top of it, so she never covers links.
- Once she catches up she sits and blinks, grooms her paw after a while, and falls back asleep after about 9 seconds of idle.
- Hover over or click her to pet her: pixel hearts and "prrr".
- On touch devices she walks to wherever you tap.
- **Knows where she is** (checked every 300ms from the area under her paws):
  - Jump to an area from the HUD, a dialogue choice or the world map and she trots over (runs if it's far), sits on top of the area's heading with a "mrrp", and rides it as the page scrolls. She lets go when you move the pointer well away or the heading leaves the screen.
  - Leave her alone for a few seconds and she may walk to the top-right corner of a nearby card (quest, skill, character card, inventory description, notice, CV card), set a toy mouse or a pebble on the edge, wind up and swat it off; it tumbles away in 90° steps. She only picks spots that leave links and controls clear.
  - In the Gallery Dungeon her eyes catch the torchlight (lit yellow with a warm pixel of glow).
  - In the village she chases the hero's fireflies (up to three pounces); a pounced firefly darts away. She keeps clear of the dialogue box and title.
  - With the campfire on screen she walks over and curls up asleep beside it.
  - When the gallery changes rooms she shows a "!" and looks over.
- She never parks on a link or control: when sitting, she checks the spot under her twice a second and shuffles off any link, button, tab or option. She always stays below the HUD.
- The HUD paw button turns her on or off, and the choice is remembered.
- **Easter egg:** the Konami code (↑↑↓↓←→←→BA) turns her ginger.
- Everything runs in her one requestAnimationFrame loop (none of it with reduced motion, or when she's sent home); outings are cheap rect reads, no per-frame layout writes.

## Sound
Optional soft 8-bit effects, synthesised with WebAudio (square/triangle notes, filtered noise; no audio files). **Off by default.** The HUD speaker toggle (a drawn pixel icon: speaker with waves when on, a red × when off; `aria-pressed`) turns them on, and the choice is remembered in `localStorage` (`neko-sound`, wrapped in try/catch). Nothing autoplays: no AudioContext exists until the toggle is clicked, and with a remembered "on" it is created on the visitor's first click or key press.
- Menu blip on hovering or keyboard-focusing a control, a two-note select on click
- A soft "pip" for every other typed dialogue letter
- Purr (or now and then a meow) when you pet the cat; a meow when she rejoins
- Page swish and chime when the gallery changes rooms
- A four-note jingle for "Quest complete" (and the ginger secret)
- Footsteps, a whoosh and an arrival chime for fast travel
- A swat and a plink when she knocks a toy off a card

## Placeholders (clearly labelled)
- Project image: "Project image coming soon"
- 4 gallery frames: "Featured portrait / Character drawing / Portrait study / Character sketch", each marked "coming soon" and "Placeholder frame. Artwork not yet hung."
- 3 notice-board cards: "First post in progress", "Coming soon"; no invented post titles
- Contact: "Contact details coming soon"
- CV: company, dates and institution "to be added"; disabled "PDF coming soon" button

## Accessibility
Skip link, landmarks (the CV hero sits inside `main`), one h1 per page, a visible lantern-yellow focus ring (ink-brown inside cream boxes, where yellow would vanish; the HUD toggles dim their icon, not their ring), ARIA tabs and listbox patterns, screen-reader copies of typed text, and decorative canvases marked `aria-hidden`. The HUD scroll-spy uses `aria-current="location"` (the CV's own link `page`); its short labels "Gallery" and "Character" carry hidden " Dungeon" / " Sheet" so names match the headings. Quest tabs take Home/End. The carousel's live counter also names the frame ("Room 2 of 4: Character drawing, coming soon"). Small text meets WCAG AA (stamp red, card labels, CV meta, footers and `--muted` were darkened or lightened for it). Common ligatures are off: Pixelify Sans draws "fi" like an "A". With `prefers-reduced-motion`, the scene is drawn once without animation, text appears without typing, the cat stays asleep (petting still works), the avatar doesn’t blink and HD switches instantly, map travel is an instant jump (no walk or iris), and the carousel slides without animation. With no JS the content stays fully visible: the avatar PNG shows, the map nodes become a list (no empty map canvas), both quest pages stack (the tab list hides), inventory items show their names as chips, objectives show their ticks, the carousel becomes a scroll-snap strip, and below 980px the HUD lays its links out and scrolls away instead of needing the Map menu.

## Known limitations
- The cat lives in viewport space (`position: fixed`). In full-page screenshots she shows up wherever the viewport bottom was at capture time.
- Silkscreen is a caps-style face, so it is limited to area headings.
- The world paint is about 55 to 150ms of work in headless Chrome (about 1M art pixels at 1440), split into idle slices; the cave stage is the largest single task (~25 to 45ms). Sprite icons use CPU-backed canvases (`willReadFrequently`), which cut the boot task from ~150 to 220ms to ~60 to 100ms. Without JS, the per-area CSS tiles and edges remain as a simpler fallback.
