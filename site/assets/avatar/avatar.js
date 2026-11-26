/* Pixel Neko Quest - party-member avatar sprites (Sabrina).
   Same format as sprites.js: arrays of equal-width strings, one char per pixel,
   "." is transparent, every other char is a key into AVATAR_SPRITES.palette.
   base/blink/smile are 64x64 (blink and smile only change the eye / mouth rows),
   tiny is 32x32 for the HUD and map marker.
   Draw with main.js drawSprite: drawSprite(ctx, AVATAR_SPRITES.base, x, y, scale, { pal: AVATAR_SPRITES.palette }) */
(function (root) {
  var P = {
    k: "#120f17", // ink outline (same as sprites.js k)
    h: "#241d26", // hair deep
    H: "#382e37", // hair shadow
    j: "#52444d", // hair base-lit
    J: "#7b6a70", // hair sheen
    i: "#a08e90", // hair glint
    s: "#fae6d2", // skin
    S: "#f0c8b0", // skin shade
    t: "#d0937f", // skin deep / nose / ear
    p: "#eeaaa2", // blush
    m: "#d6766f", // lips
    e: "#2a2230", // iris dark
    E: "#5e4f5a", // iris light
    W: "#ffffff", // eye glint
    w: "#f7f2e8", // shirt / sclera
    c: "#cfc4c0", // shirt shade
    g: "#a19aa4", // sweater vest
    r: "#c4405a", // tie berry
    u: "#5a80c0", // tie blue
    R: "#7a2e48", // tie dark
    b: "#262234", // blazer
    B: "#3a3552", // blazer light (sprites.js b)
    n: "#575177"  // blazer edge (sprites.js h)
  };

  /* 64x64 bust portrait */
  var base = [
    "................................................................",
    "...........................kkkkkkkkkk...........................",
    "........................kkkjjjjjjjjjjkkk........................",
    "......................kkjjjjjjjHjjjjjjjjkk......................",
    ".....................kjjjjjjjjjhjjjjjjjjjjk.....................",
    "....................kjjJJjjjjjHhjHjjjjjJJjjk....................",
    "...................kjjJJJjjjHHHhHHHHjjjJJJjjk...................",
    "..................kjjJiJjjjjHHHHHHHHjjjjJiJjjk..................",
    ".................kjjJJjJjjHHHHHHHHHHHHjjJjJJjjk.................",
    "................kjjJJjJjjHHHHHHHHHHHHHHjjJjJJjjk................",
    "...............kjjJJJjjjHHHHHHHHHHHHHHHHjjjJJJjjk...............",
    "..............kjjJJjJjjHHHHHHHHHHHHHHHHHHjjJjJJjjk..............",
    ".............kjjJJjjjHHHHHHHHHHHHHHHHHHHHHHjjjJJjjk.............",
    ".............kjJJjjhHHHHHHHHHHHHHHHHHHHHHHHHhjjJJjk.............",
    "............kjJjjjhHHHHHHHHHhhHHHhhhHHHHHHHHHhjjjJjk............",
    "...........kjjHHHhHHHHHHjjhhSSHjHSSShhjjHHHHHHhHHHjjk...........",
    "...........kjjHHHhHHHHHjHhSSsSHjHSssSShHjHHHHHhHHHjjk...........",
    "..........kjjHHHhHHHHHjHhSsssSHjHSssssShHjHHHHHhHHHjjk..........",
    ".........kjHjHHHhHHHHjHhSssssSHjHSsssssShHjHHHHhHHHjHjk.........",
    ".........kjjHHHHhHHHHjHhSssssssjHSsssssShHjHHHHhHHHHjjk.........",
    "........kjjHHHHhHHHHHHhSsssssssjHSssssssShHHHHHHhHHHHjjk........",
    ".......kjjjHhHHhHHHHHhSssssssssjHSsssssssShHHHHHhHHhHjjjk.......",
    "......kjjjHHhHHhHHHHHhSssssssssjHSsssssssShHHHHHhHHhHHjjjk......",
    ".....kHjjHHhjHhHHHHHhSsssssssssjHSssssssssShHHHHHhHjhHHjjHk.....",
    ".....kjJjHhHjHhHHHHhSssssssssssSHSsssssssssShHHHHhHjHhHjJjk.....",
    "....kHjJHHhjHHhHHHhSsssssssssssSHSssssssssssShHHHhHHjhHHJjHk....",
    "....kjJHHHhjHHhHHhSssssssssssssSHSsssssssssssShHHhHHjhHHHJjk....",
    "....kjJHHHhJHHhhhSsssjHHHHHHHssSHSsHHHHHHHjsssShhhHHJhHHHJjk....",
    "....kjjHHhjJHHhSSsssssssssssssssSSsssssssssssssSShHHJjhHHjjHk...",
    "....kjjHHhjJHhSsssskkkkkkkkktsssSsstkkkkkkkkkssssShHJjhHHjjHk...",
    "....kjhHHhjJHhStsssskwweWeewSssssssSweWeewwksssstShHJjhHHhjk....",
    "...kjHHhHhjHHhStssssSwwEeeEwsssssssswEeeEwwSsssstShHHjhHhHHjk...",
    "...kjHHHHhjHHhStsssssSSStttSssssssssStttSSSssssstShHHjhHHHHjk...",
    "....kjjHHhjHHhSssssssspppsssssssssssssspppsssssssShHHjhHHjjk....",
    "...kjHHHHhjHHHhSssssssssssssssssssssssssssssssssShHHHjhHHHHjk...",
    "...kHJHHhHjHHHHhhSsssssssssssssssssssssssssssSShhHHHHjHhHHJHk...",
    "...kHjJHhHjHjHhHHhSsssssssssssstssssssssssssSShHHhHjHjHhHJjHHk..",
    "...kHjJHhHjHjHhHHhSsssssssssssssSsssssssssssSShHHhHjHjHhHJjHHk..",
    "...khHjHhHjHjHhHHHhSsssssssssssssssssssssssSShHHHhHjHjHhHjHhk...",
    "...kHhjHhHjHjHHhHhHhSsssssssssssssssssssssSShHhHhHHjHjHhHjhHk...",
    "..kHHHjHHhHjHjHhHhHhSsssssssssssssssssssssSShHhHhHjHjHhHHjHHHk..",
    "..kHHHjHHhHjHjHhHhHhhSssssssssSmmmSssssssSShhHhHhHjHjHhHHjHHHk..",
    "..kHHHjHHhHHHhjHhhhHhhSsssssssspppssssssSShhHhhhHjhHHHhHHjHHHk..",
    "...kjHHHHHhHhHHHhhhHhhhhSssssssssssssssShhhhHhhhHHHhHhHHHHHjk...",
    "...kHjHHHHhHhHHHhhhhhhhhhSssssssssssssShhhhhhhhhHHHhHhHHHHjHHk..",
    "...kHHjHHHhHHHHHHhhhhhhhhhhSssssssssShhhhhhhhhhHHHHHHhHHHjHHHk..",
    "...kHHHjHHhHHHHHHhhhhhhhhhhhhSssssShhhhhhhhhhhhHHHHHHhHHjHHHk...",
    "...kHHHHHkHHHHHHHhhkhhhhhhSSStsssstSSShhhhhhkhhHHHHHHHkHHHHHk...",
    "...kHHHHk.kHHHHHHkk.khhhwwSSSSttttSSSSwwhhhk.kkHHHHHHk.kHHHHk...",
    "....kkkk...kHHHkk....khhwwcSSSSSSSSSScwwhhk....kHHHkk...kHHk....",
    "............kkk......khhwwwcSSSSSSSScwwwbbk.....kkk......kk.....",
    "...................kkBbnwwwwcSSSSSScwwwwBbBkk...................",
    "..................kBBbbnwwwwwcSSSScwwwwwBbbBBk..................",
    "................kkBbbbkBwwwwwwcSScwwwwwwBkbbbBkk................",
    "...............kBBbbbbkBwwwwwcrruucwwwwwBkbbbbBBk...............",
    ".............kkBbbbbbbkBwwwwwcruurcwwwwwBkbbbbbbBkk.............",
    "...........kkBBbbbbbbkBBgwwwwcuurrcwwwwgBBkbbbbbbBBkk...........",
    ".........kkBBbbbbbbbbkBBggwwwccRRccwwwggBBkbbbbbbbbBBkk.........",
    ".......kkBBbbbbbbbbbkBBBgggwcwcRrcwcwgggBBBkbbbbbbbbbBBkk.......",
    ".....kknnbbbbbbbbbbbkBBBggggwwruurwwggggBBBkbbbbbbbbbbbBBkk.....",
    "....knnbbbbbbbbbbbbbkBBBggggwcuurrcwggggBBBkbbbbbbbbbbbbbBBk....",
    "...knbbbbbbbbbbbbbbkBBBBgggggcurrucgggggBBBBkbbbbbbbbbbbbbbBk...",
    "...kbbbbbbbbbbbbbbbkBBBBgggggcrruucgggggBBBBkbbbbbbbbbbbbbbbk...",
    "...kbbbbbbbbbbbbbbkBBBBBgggggcruurcgggggBBBBBkbbbbbbbbbbbbbbk..."
  ];

  /* blink: same sprite, only these rows differ */
  var blink = base.slice();
  blink[29] = "....kjjHHhjJHhSsssssssssssssssssSssssssssssssssssShHJjhHHjjHk...";
  blink[30] = "....kjhHHhjJHhStsssSSSSSSSSSssssssssSSSSSSSSSssstShHJjhHHhjk....";
  blink[31] = "...kjHHhHhjHHhStssskkkkkkkkksssssssskkkkkkkkkssstShHHjhHhHHjk...";
  blink[32] = "...kjHHHHhjHHhStsssssSttSSSssssssssssSSSttSssssstShHHjhHHHHjk...";

  /* smile: same sprite, only these rows differ */
  var smile = base.slice();
  smile[40] = "..kHHHjHHhHjHjHhHhHhSsssssssssmsssmsssssssSShHhHhHjHjHhHHjHHHk..";

  /* 32x32 tiny version (HUD / map marker) */
  var tiny = [
    ".............kjjjjk.............",
    "...........kkjjHjjjkk...........",
    "..........kjjjjhjjjjjk..........",
    ".........kJJjjHhHHjjJJk.........",
    "........kjiJjHHHHHHjJJjk........",
    ".......kjJJjHHHHHHHHjJJjk.......",
    "......kjJJjHHHHHHHHHHjJJjk......",
    "......kJHHHHHhhjHhhHHHHHJk......",
    ".....kHHhHHHhSSjHSShHHHhHHk.....",
    ".....kHhHjHhSsSjHSsShHjHhHk.....",
    "....kHHhjHhSssSjHSssShHjhHHk....",
    "...kjHhHjhSssssSHSsssShjHhHjk...",
    "...kHHhjhSsssssSHSssssShjhHHk...",
    "..kjJHhhSShhhhSSHShhhhSShhHJjk..",
    "..kjHHhSsskkkkssSskkkkssShHHjk..",
    "..kHHhhtsswWesssssWewsssthhHHk..",
    "..kHHhhSsssSppssssppSsssShhHHk..",
    "..kjHhjhSssssssssssssssShjhHjk..",
    "..kHhHjhhSssssstssssssShhjHhHk..",
    ".kjHhHHHhSssssssssssssShHHHhHjk.",
    ".kjHHhHHhhSssssppssssShhHHhHHjk.",
    ".kHHHhHHhhhSssssssssShhhHHhHHHk.",
    "..kHHhHhhhhhhSssssShhhhhhHhHHk..",
    "..kHHkHhhhhhhSSssSShhhhhhHkHHk..",
    "..kkk.kkkhhwwSSttSSwwhhkkk.kkk..",
    ".........kbwwcSSSScwwbk.........",
    ".......kkBbwwwcSScwwwbBkk.......",
    ".....kkBBbbwwwwurwwwwbbBBkk.....",
    "...kkBBbbbBgwwwRRwwwgBbbbBBkk...",
    "..knBbbbbbBggwcrucwggBbbbbbBnk..",
    ".knbbbbbbBBgggwurwgggBBbbbbbbnk.",
    ".kbbbbbbbBBggggruggggBBbbbbbbbk."
  ];

  root.AVATAR_SPRITES = { palette: P, base: base, blink: blink, smile: smile, tiny: tiny };
})(typeof window !== "undefined" ? window : globalThis);
