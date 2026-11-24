/* Pixel Neko Quest — hand-written sprite data.
   Every sprite is an array of equal-width strings; each character is a palette key,
   "." is transparent. All art is original and drawn here, pixel by pixel. */
(function (root) {
  var PAL = {
    k: "#120f17", // ink outline
    b: "#3a3552", // cat body
    d: "#28243b", // cat shade
    h: "#575177", // cat highlight
    w: "#f4ead0", // cream
    z: "#ffffff", // white-hot
    e: "#a6e86a", // cat eye green
    p: "#ea9aa9", // pink
    y: "#f5c451", // lantern yellow
    Y: "#c98f2a", // lantern deep
    o: "#e57f2e", // ember orange
    O: "#a8431f", // ember dark
    g: "#62a447", // leaf
    G: "#2f6b34", // pine
    m: "#b9d86a", // moss light
    r: "#c4503f", // berry red
    R: "#7a2e2a", // berry dark
    B: "#69dccb", // crystal light
    T: "#2a8a80", // crystal deep
    n: "#0b1d22", // night
    a: "#9aa3a0", // stone light
    A: "#5d6866", // stone dark
    l: "#b07a43", // wood light
    L: "#6b4423", // wood dark
    c: "#d6c49a"  // parchment shade
  };

  var S = {};

  /* ---------- the cat (facing right) 20x16 ---------- */
  S.catWalkA = [
    "..........k.......k.",
    "..........kk.....kk.",
    "..........kpkkkkkpk.",
    "..k.......kbbbbbbbk.",
    ".kbk......kbebbbebk.",
    ".kbk......kbebpbebk.",
    "..kbk.....kbwwkwwbk.",
    "..kbk.kkkkkgggygggk.",
    "...kbbbbbbbbbbbwwbk.",
    "....kbbbbbbbbbbwwbk.",
    "....kdbbbbbbbbbbbbk.",
    "....kddbbbbbbbbbdk..",
    "....kbbkkkkkkkkbbk..",
    "...kbk........kbk...",
    "..kbk..........kbk..",
    "..kk............kk.."
  ];
  S.catWalkB = [
    "....................",
    "..........k.......k.",
    "..........kk.....kk.",
    ".k........kpkkkkkpk.",
    "kbk.......kbbbbbbbk.",
    "kbk.......kbebbbebk.",
    ".kbk......kbebpbebk.",
    "..kbk.kkkkkbwwkwwbk.",
    "...kbbbbbbbgggygggk.",
    "....kbbbbbbbbbbwwbk.",
    "....kdbbbbbbbbbbbbk.",
    "....kddbbbbbbbbbdk..",
    "....kbbkkkkkkkkbbk..",
    "....kbk.....kbk.....",
    "....kbk.....kbk.....",
    "....kk......kk......"
  ];
  S.catSit = [
    ".....k.......k......",
    ".....kk.....kk......",
    ".....kpkkkkkpk......",
    ".....kbbbbbbbk......",
    ".....kbebbbebk......",
    ".....kbebpbebk......",
    ".....kbwwkwwbk......",
    ".....kgggygggk......",
    "....kbbbwwwbbbk.....",
    "....kbbbwwwbbbk.....",
    "...kbbbbwwwbbbbk.kk.",
    "...kbbbbbwbbbbbk.kbk",
    "...kdbbbbbbbbbdk.kbk",
    "...kdbkwwkwwkbdkkbk.",
    "...kddkwwkwwkddbbk..",
    "....kkkkkkkkkkkkk..."
  ];
  S.catBlink = S.catSit.slice();
  S.catBlink[4] = ".....kbbbbbbbk......";
  S.catBlink[5] = ".....kbkbpbkbk......";
  S.catGroomA = [
    ".....k.......k......",
    ".....kk.....kk......",
    ".....kpkkkkkpk......",
    ".....kbbbbbbbk......",
    ".....kbbbbbbbk......",
    ".....kbkbpbkbk......",
    ".....kkwwkpwbk......",
    ".....kwwwkgygk......",
    "....kbkwkbwwbbk.....",
    "....kbbkbwwwbbk.....",
    "...kbbbbwwwbbbbk.kk.",
    "...kbbbbbwbbbbbk.kbk",
    "...kdbbbbbbbbbdk.kbk",
    "...kdbkwwkbbbbdkkbk.",
    "...kddkwwkbbkddbbk..",
    "....kkkkkkkkkkkkk..."
  ];
  S.catGroomB = [
    "....................",
    ".....k.......k......",
    ".....kk.....kk......",
    ".....kpkkkkkpk......",
    ".....kbbbbbbbk......",
    ".....kbkbpbkbk......",
    ".....kbwwpwwbk......",
    ".....kkwwkgygk......",
    "....kbkwwkwwbbk.....",
    "....kbbkkwwwbbk.....",
    "...kbbbbwwwbbbbk.kk.",
    "...kbbbbbwbbbbbk.kbk",
    "...kdbbbbbbbbbdk.kbk",
    "...kdbkwwkbbbbdkkbk.",
    "...kddkwwkbbkddbbk..",
    "....kkkkkkkkkkkkk..."
  ];
  S.catSleepA = [
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "...........k...k....",
    "......kkkkkkpkkkpk..",
    "....kkbbbbbbbbbbbbk.",
    "...kbbbbbbbbkbbbbbbk",
    "..kbbbbbbbbkbkkbkkbk",
    "..kdbbbbbbbkbbbpbbk.",
    "..kddwwwwwwwwkkkkk..",
    "...kkkkkkkkkkkk....."
  ];
  S.catSleepB = S.catSleepA.slice(1, 14).concat([S.catSleepA[13], S.catSleepA[14], S.catSleepA[15]]);
  /* batting at a toy: paw raised (A), then swiped down and out (B) */
  S.catBatA = S.catSit.slice();
  S.catBatA[9]  = ".kkkkbbbwwwbbbk.....";
  S.catBatA[10] = "kwwkbbbbwwwbbbbk.kk.";
  S.catBatA[11] = "kwwkbbbbbwbbbbbk.kbk";
  S.catBatA[12] = ".kkkdbbbbbbbbbdk.kbk";
  S.catBatA[13] = "...kdbbbbkwwkbdkkbk.";
  S.catBatA[14] = "...kddbbbkwwkddbbk..";
  S.catBatB = S.catSit.slice();
  S.catBatB[10] = "kkkkbbbbwwwbbbbk.kk.";
  S.catBatB[11] = "kwwkbbbbbwbbbbbk.kbk";
  S.catBatB[12] = "kwwkdbbbbbbbbbdk.kbk";
  S.catBatB[13] = "kkkkdbbbbkwwkbdkkbk.";
  S.catBatB[14] = "...kddbbbkwwkddbbk..";

  /* things she knocks off ledges */
  S.toyMouse = [
    "..kk.....",
    ".kpkkkk..",
    "kakaaaak.",
    "kaaaaaakk",
    ".kkkkkk.k"
  ];
  S.pebble = [
    ".kkk.",
    "kaaak",
    "kAAAk",
    ".kkk."
  ];

  /* HUD sound toggle: speaker with waves / speaker muted */
  S.sndOn = [
    "....kk......",
    "...kwk....y.",
    "kkkwwk.y...y",
    "kwwwwk..y..y",
    "kwwwwk..y..y",
    "kwwwwk..y..y",
    "kkkwwk.y...y",
    "...kwk....y.",
    "....kk......"
  ];
  S.sndOff = [
    "....kk......",
    "...kwk......",
    "kkkwwk.r...r",
    "kwwwwk..r.r.",
    "kwwwwk...r..",
    "kwwwwk..r.r.",
    "kkkwwk.r...r",
    "...kwk......",
    "....kk......"
  ];

  /* ---------- world-map landmarks 16x16 ---------- */
  S.house = [
    ".......kk.......",
    "......krrk...kk.",
    ".....krrrrk.kAk.",
    "....krrrrrrkkAk.",
    "...krrrrrrrrrkk.",
    "..krrrrrrrrrrrk.",
    ".krrrrrrrrrrrrrk",
    "kRRRRRRRRRRRRRRk",
    ".kwwwwwwwwwwwwk.",
    ".kwkkkwwwwkkkwk.",
    ".kwkykkkkkkykwk.",
    ".kwkkkkLLkkkkwk.",
    ".kwwwwkLLkwwwwk.",
    ".kwwwwkLykwwwwk.",
    ".kcccckLLkcccck.",
    "kkkkkkkkkkkkkkkk"
  ];
  S.scroll = [
    "................",
    "..kkkkkkkkkkk...",
    ".klLkwwwwwwwwk..",
    ".kLlkwwwwwwwwk..",
    "..kkwkkkkkkwwk..",
    "...kwwwwwwwwwk..",
    "...kwkkkkkwwwk..",
    "...kwwwwwwwwwk..",
    "...kwkkkkkkkwk..",
    "...kwwwwwwwwwk..",
    "...kwkkkkwwwwk..",
    "...kwwwwwwwwwk..",
    "...kwwwwwwwkkkk.",
    "...kwwwwwwkLlLlk",
    "...kkkkkkkklLlLk",
    "..........kkkkk."
  ];
  S.gate = [
    "................",
    "....kkkkkkkk....",
    "..kkaaAaaAaakk..",
    ".kaaAkkkkkkAaak.",
    ".kaAknnnnnnkAak.",
    "kaaknnnnnnnnkaak",
    "kAaknnnnnnnnkaAk",
    "kaaknnnnnnnnkAak",
    "kAaknynnnynnkaak",
    "kaaknnnnnnnnkaAk",
    "kaAknnnnnnnnkaak",
    "kaaknnnnnnnnkAak",
    "kAaknnnnnnnnkaak",
    "kaaknnnnnnnnkaak",
    "kaakAAAAAAAAkaak",
    "kkkkkkkkkkkkkkkk"
  ];
  S.banner = [
    "..kk............",
    "..kykkkkkkkkk...",
    "..kkgggggggggk..",
    "..kkggggyggggk..",
    "..kkgggyyygggk..",
    "..kkggyyyyyggk..",
    "..kkgggyyygggk..",
    "..kkggygggyggk..",
    "..kkgggggggggk..",
    "..kkggk...kggk..",
    "..kkk.....kk....",
    "..kk............",
    "..kk............",
    "..kk............",
    ".kAAk...........",
    "kkkkkk.........."
  ];
  S.board = [
    "................",
    ".kkkkkkkkkkkkkk.",
    ".kLLLLLLLLLLLLk.",
    ".kLwwwwLLcccLLk.",
    ".kLwkkwLLcrcLLk.",
    ".kLwwwwLLcccLLk.",
    ".kLwkkwLLckcLLk.",
    ".kLwwwwLLcccLLk.",
    ".kLLLLLLLLLLLLk.",
    ".kkkkkkkkkkkkkk.",
    "...kLk....kLk...",
    "...kLk....kLk...",
    "...kLk....kLk...",
    "...kLk....kLk...",
    "..gkLkg..gkLkg..",
    ".gggggggggggggg."
  ];
  S.crystal = [
    ".......kk.......",
    "......kBBk......",
    ".....kBzBTk.....",
    "....kBzBBTTk....",
    "...kBzBBBTTTk...",
    "...kBBBBBTTTk...",
    "..kBBBBBBTTTTk..",
    "..kBBBBBBTTTTk..",
    "...kBBBBTTTTk...",
    "....kBBBTTTk....",
    ".....kBBTTk.....",
    "......kBTk......",
    ".......kk.......",
    "....kkkkkkkk....",
    "...kaaaaaaaak...",
    "..kAAAAAAAAAAk.."
  ];

  /* ---------- inventory 16x16 ---------- */
  S.gear = [
    "................",
    "......kkkk......",
    "...kk.kaak.kk...",
    "..kaakkaakkaak..",
    "..kaaaaaaaaaak..",
    "...kaaAAAAaak...",
    ".kkkaAkkkkAakkk.",
    ".kaaaAk..kAaaak.",
    ".kaaaAk..kAaaak.",
    ".kkkaAkkkkAakkk.",
    "...kaaAAAAaak...",
    "..kaaaaaaaaaak..",
    "..kaakkaakkaak..",
    "...kk.kaak.kk...",
    "......kkkk......",
    "................"
  ];
  S.key = [
    "................",
    "......kkkk......",
    ".....kyyyyk.....",
    "....kyykkyyk....",
    "....kyk..kyk....",
    "....kyk..kyk....",
    "....kyykkyyk....",
    ".....kyyyYk.....",
    "......kyYk......",
    "......kyYk......",
    "......kyYkkk....",
    "......kyYyYk....",
    "......kyYkkk....",
    "......kyYyYk....",
    "......kyYkkk....",
    "......kkkk......"
  ];
  S.boots = [
    "................",
    "................",
    "......kkkkk.....",
    "......kLLLk.....",
    "..kk..klllk.....",
    ".kwwk.klllk.....",
    ".kwwwkklllk.....",
    "..kwwwklllk.....",
    "...kkkklllkk....",
    "......kllllLkk..",
    "......klllllllk.",
    "......kLLLLLLLLk",
    "......kkkkkkkkkk",
    "................",
    "................",
    "................"
  ];
  S.letter = [
    "................",
    "................",
    "................",
    ".kkkkkkkkkkkkkk.",
    ".kckwwwwwwwwkck.",
    ".kwckwwwwwwkcwk.",
    ".kwwckwwwwkcwwk.",
    ".kwwwckrrkcwwwk.",
    ".kwwwwkrrkwwwwk.",
    ".kwwwwwkkwwwwwk.",
    ".kwwwwwwwwwwwwk.",
    ".kcccccccccccck.",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................"
  ];
  S.sketchbook = [
    "................",
    "............kk..",
    ".kkkkkkkkk.kpk..",
    ".kkwwwwwwk.kak..",
    ".kawwwwwwk.kyk..",
    ".kkwkkwwwk.kyk..",
    ".kawkwkwwk.kyk..",
    ".kkwwkkwwk.kyk..",
    ".kawwwwwwk.kyk..",
    ".kkwwwwwwk.kyk..",
    ".kawwwwwwk.kyk..",
    ".kkwwwwwwk.kck..",
    ".kkkkkkkkk..k...",
    "................",
    "................",
    "................"
  ];
  S.books = [
    "................",
    "................",
    "................",
    "..kkkkkkkkkkk...",
    "..krryyrrrrrwk..",
    "..kRRRRRRRRRwk..",
    "..kkkkkkkkkkkk..",
    "...kgggggyygwk..",
    "...kGGGGGGGGwk..",
    "..kkkkkkkkkkkkk.",
    "..kBBByyBBBBBwk.",
    "..kTTTTTTTTTTwk.",
    "..kkkkkkkkkkkkk.",
    "................",
    "................",
    "................"
  ];

  /* ---------- quest-state icons ---------- */
  S.lantern = [
    "......kkkk......",
    ".....k....k.....",
    "......kkkk......",
    ".....kAAAAk.....",
    "....kkkkkkkk....",
    "....kyyzzyyk....",
    "....kyzzzzyk....",
    "....kyyzzyyk....",
    "....kyyyyyyk....",
    "....kYyyyyYk....",
    "....kkkkkkkk....",
    ".....kAAAAk.....",
    "......kkkk......",
    "................",
    "................",
    "................"
  ];
  S.book = [
    "................",
    "................",
    "................",
    "................",
    ".kkkkkk..kkkkkk.",
    "kwwwwwwkkwwwwwwk",
    "kwkkkkwkkwkkkkwk",
    "kwwwwwwkkwwwwwwk",
    "kwkkkwwkkwkkkkwk",
    "kwwwwwwkkwwwwwwk",
    "kwkkkkwkkwkkkwwk",
    "kwwwwwwkkwwwwwwk",
    "kkkkkkkLLkkkkkkk",
    ".kLLLLLkkLLLLLk.",
    "..kkkkk..kkkkk..",
    "................"
  ];
  S.compass = [
    ".......kk.......",
    ".....kkkkkk.....",
    "...kkyyyyyykk...",
    "..kyywwrrwwyyk..",
    ".kywwwrrrrwwwyk.",
    ".kywwwrrrrwwwyk.",
    "kywwwwwrrwwwwwyk",
    "kywwwwkyykwwwwyk",
    "kywwwwkyykwwwwyk",
    "kywwwwwaawwwwwyk",
    ".kywwwaaaawwwyk.",
    ".kywwwaaaawwwyk.",
    "..kyywwaawwyyk..",
    "...kkyyyyyykk...",
    ".....kkkkkk.....",
    "................"
  ];

  /* ---------- small bits ---------- */
  S.heart = [
    ".kk.kk.",
    "kzrkrrk",
    "krrrrrk",
    "krrrrrk",
    ".krrrk.",
    "..krk..",
    "...k..."
  ];
  S.lock = [
    "....kkkk....",
    "...kaaaak...",
    "..kak..kak..",
    "..kak..kak..",
    ".kkkkkkkkkk.",
    ".kyyyyyyyyk.",
    ".kyyykkyyyk.",
    ".kYyykkyyYk.",
    ".kYyyykyyYk.",
    ".kYYYYYYYYk.",
    ".kkkkkkkkkk."
  ];
  S.chest = [
    "..kkkkkkkkkkkk..",
    ".kLllllllllllLk.",
    "kLllllllllllllLk",
    "kLLLLLLyyLLLLLLk",
    "kkkkkkkyykkkkkkk",
    "kLllllkYYkllllLk",
    "kLlllllkklllllLk",
    "kLllllllllllllLk",
    "kLLLLLLLLLLLLLLk",
    "kkkkkkkkkkkkkkkk"
  ];
  S.quill = [
    "..........kk",
    ".........kwk",
    "........kwwk",
    ".......kwwck",
    "......kwwck.",
    ".....kwwck..",
    "....kwwck...",
    "...kwwck....",
    "..kwcck.....",
    "..kcck......",
    ".kkk........",
    ".kk.........",
    "k..........."
  ];
  S.catHead = [
    "k.......k",
    "kk.....kk",
    "kpkkkkkpk",
    "kbbbbbbbk",
    "kbebbbebk",
    "kbebpbebk",
    "kbwwkwwbk",
    ".kkkkkkk."
  ];
  S.paw = [
    ".kk.kk.",
    "kppkppk",
    "kk.k.kk",
    "kpkkkpk",
    "kpppppk",
    "kpppppk",
    ".kkkkk."
  ];
  S.flame1 = [
    "...R....",
    "..RyR...",
    "..RyR...",
    ".RyyyR..",
    ".RyoyyR.",
    "RyoozyR.",
    "RyozzoR.",
    ".RozooR.",
    "..RooR..",
    "...RR..."
  ];
  S.flame2 = [
    "....R...",
    "...RyR..",
    "..RyyR..",
    "..RyyyR.",
    ".RyyoyR.",
    ".RyozoyR",
    ".RyozzoR",
    ".RoozoR.",
    "..RooR..",
    "...RR..."
  ];
  S.flame3 = [
    "..R.....",
    "..RyR...",
    ".RyyR...",
    ".RyyyR..",
    ".RyoyyR.",
    "RyoozyR.",
    "RyozzyR.",
    ".RozooR.",
    "..RooR..",
    "...RR..."
  ];
  S.logs = [
    "kkk..........kkk",
    "kllkk......kkllk",
    "kLllLkk..kkLllLk",
    ".kkLLLLkkLLLLkk.",
    "...kkLLLLLLkk...",
    "..kkLLkkkkLLkk..",
    ".kLLkk....kkLLk.",
    "kkkk........kkkk"
  ];
  S.pine = [
    "...k...",
    "..kmk..",
    "..kgk..",
    ".kmgGk.",
    ".kggGk.",
    "kmggGGk",
    ".kgGGk.",
    "kmgGGGk",
    "kkkLkkk",
    "...L..."
  ];
  S.check = [
    "........kk",
    ".......kgk",
    "......kggk",
    "kk...kggk.",
    "kgk.kggk..",
    "kggkggk...",
    ".kgggk....",
    "..kgk.....",
    "...k......"
  ];
  S.star = [
    "...k...",
    "..kyk..",
    "kkkykkk",
    "kyyyyyk",
    ".kyyyk.",
    ".kykyk.",
    "kk...kk"
  ];

  /* "you are here" map pin, 9x11 */
  S.pin = [
    "..kkkkk..",
    ".kyyyyyk.",
    "kyzyyyyYk",
    "kyykkkyYk",
    "kyykwkyYk",
    "kyykkkyYk",
    ".kyyyyYk.",
    "..kyyYk..",
    "..kyYYk..",
    "...kYk...",
    "....k...."
  ];

  root.SPR = { PAL: PAL, S: S };
})(typeof window !== "undefined" ? window : globalThis);
