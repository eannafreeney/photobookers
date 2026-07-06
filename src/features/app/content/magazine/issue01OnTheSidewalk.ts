export type MagazineEssaySection = {
  id: string;
  kicker?: string;
  title: string;
  paragraphs: string[];
};

export type MagazineBookEntry = {
  slug: string;
  blurb: string;
  artistPrompt?: string;
};

export const issue01Meta = {
  issueNumber: 1,
  slug: "on-the-sidewalk",
  title: "On the Sidewalk",
  subtitle: "Nine photobooks about what happens between strangers in public",
  kicker: "Issue 01",
  publishedLabel: "August 2026",
  readingMinutes: 12,
  coverUrl: "/magazine/issue-01-on-the-sidewalk-cover.png",
} as const;

export const issue01EditorsLetter = {
  title: "Editor's letter",
  paragraphs: [
    "The sidewalk is the most photographed room in the world and the least owned. It belongs to everyone and no one. Photobooks about the street rarely argue for the street as a genre — they accumulate incidents: a glare, a sandwich board, a child running through a housing estate, a pay phone that outlived its purpose.",
    "This first issue is not a survey of street photography. It is a walk. Nine books, nine cities or stretches of city, nine ways of handling the same problem: how do you make a sequence from chaos without pretending you were never there?",
    "We invited each artist to respond. Where they did, their words appear below the book. Where they didn't yet, we wrote from the book — but the invitation stands.",
  ],
} as const;

export const issue01EssaySections: MagazineEssaySection[] = [
  {
    id: "editing-table",
    title: "The pavement as editing table",
    paragraphs: [
      "Every street photograph is a small act of theft. You take a face, a stride, a coincidence of shadow and signage, and you carry it home. The photobook is where that theft becomes architecture: spreads that rhyme, pauses that feel like turning a corner, repetitions that turn accident into intention.",
      "Walk long enough through the history of the medium and you notice the sidewalk changes its job. In some books it is a stage for class and costume. In others it is infrastructure — the thing you must cross to get to the subject that matters. In still others it is the subject: not people, but the social grammar that organizes them.",
    ],
  },
  {
    id: "invisibility",
    kicker: "I",
    title: "The polite fiction of invisibility",
    paragraphs: [
      "Street photography's oldest contract is that the photographer is not really there. The book accepts this fiction and then undermines it with design. Sidewalks treats London's pavement as a surface for graphic incident — gum, stains, the abstractions that remain when the crowd leaves. The body is implied. The edit is cool, almost forensic, as if the city has already forgotten who passed through.",
      "Compare that to Hong Kong Parr: color loud enough to hear, consumption as choreography. Parr does not hide behind invisibility; he wagers on proximity. The sidewalk here is a market of appetites. You are not watching people; you are watching watching — tourism, appetite, the camera meeting its match in a city that performs for everyone.",
    ],
  },
  {
    id: "obsolete",
    kicker: "II",
    title: "Obsolete objects, living streets",
    paragraphs: [
      "Cities shed skins. Pay Phone lingers on a New York fixture that younger readers may need footnotes to recognize. The pay phone is a monument to a previous regime of public intimacy — conversations conducted in glass booths, coins, cords. The book is quieter than nostalgia usually allows. The street continues around the dead object; the edit asks what else we are about to step over without noticing.",
      "Mixed Messages works the same seam from another angle: signage, protest placards, Halloween masks, political slogans half-read through a crowd. The sidewalk becomes a reader. Treacy collects utterances the city throws off without author. A photobook of signs is never only about signs; it is about who gets to speak in public space and who is reduced to walking past.",
    ],
  },
  {
    id: "children",
    kicker: "III",
    title: "Children and permission",
    paragraphs: [
      "Some of the most enduring street work required a different contract entirely: permission, play, time. Play Space, North Kensington 1967–1969 documents an adventure playground — not the picturesque street, but the sanctioned wild zone carved out of it. Children invent geography faster than planners. The sequences feel less like hunting and more like staying: the camera as participant in a game with rules only partly visible to adults.",
      "Soho & North East London 1980s–1990s moves from that innocence into nightlife's harder light — Soho's economies of desire and display, east London's post-industrial edges. Two books, two Londons, two notions of who owns the pavement after dark.",
    ],
  },
  {
    id: "elsewhere",
    kicker: "IV",
    title: "Elsewhere, same grammar",
    paragraphs: [
      "The street's grammar travels. Pants on Top of Shoes finds Tbilisi's sidewalks marked by post-Soviet texture — humor and wear in the same frame, the body slightly absurd against architecture that does not apologize. Dérive #1 applies psychogeographic drift to Mannheim: not the landmark city but the immigrant's second home, Wahlheimat, chosen rather than inherited.",
      "L.A. Polaroids compresses Los Angeles into instant film — cinema's eye turned to the parking lot, the palm tree, the incidental epic. Polaroid as sidewalk: immediate, disposable, somehow permanent once bound.",
    ],
  },
  {
    id: "what-the-book-adds",
    kicker: "V",
    title: "What the book adds",
    paragraphs: [
      "None of these projects ends on the single image. The book demands pacing. A corner repeated becomes motif. A face that returns becomes character whether or not we know a name. The sidewalk, which in life is experienced as flow, becomes in print a series of decisions: this and not that, now and not then.",
      "That is this magazine's interest. Not \"street photography\" as a badge, but the sidewalk as the place where public life is edited into private meaning — and then, generously, offered back to strangers who will walk their own route through the pages.",
      "If there is a politics here, it is small and daily: who appears, who is cropped out, who is asked, who is only taken. The best street photobooks do not resolve that politics. They make you feel its weight under your feet.",
    ],
  },
];

export type MagazineBookPlacement = {
  slug: string;
  afterSectionId: string;
  afterParagraphIndex: number;
};

export const issue01BookPlacements: MagazineBookPlacement[] = [
  {
    slug: "sidewalks-adam-mcewen",
    afterSectionId: "invisibility",
    afterParagraphIndex: 0,
  },
  {
    slug: "hong-kong-parr-martin-parr",
    afterSectionId: "invisibility",
    afterParagraphIndex: 1,
  },
  {
    slug: "pay-phone-daniel-weiss",
    afterSectionId: "obsolete",
    afterParagraphIndex: 0,
  },
  {
    slug: "mixed-messages-paul-treacy",
    afterSectionId: "obsolete",
    afterParagraphIndex: 1,
  },
  {
    slug: "play-space-north-kensington-19671969-adam-ritchie",
    afterSectionId: "children",
    afterParagraphIndex: 0,
  },
  {
    slug: "soho-north-east-london-1980s1990s-2-books-tony-kearns",
    afterSectionId: "children",
    afterParagraphIndex: 1,
  },
  {
    slug: "pants-on-top-of-shoes-ivan-anisimov",
    afterSectionId: "elsewhere",
    afterParagraphIndex: 0,
  },
  {
    slug: "derive-1-monnem-wahlheimat-sandra-koestler",
    afterSectionId: "elsewhere",
    afterParagraphIndex: 0,
  },
  {
    slug: "la-polaroids-robby-muller",
    afterSectionId: "elsewhere",
    afterParagraphIndex: 1,
  },
];

export const issue01BookEntries: MagazineBookEntry[] = [
  {
    slug: "sidewalks-adam-mcewen",
    blurb:
      "London's pavement as abstract field: stains, gum, marks of passage. People are absent but implied; the edit is restrained, almost clinical. A reminder that street work need not chase the decisive human moment — sometimes the ground holds the memory.",
    artistPrompt: "What on the sidewalk do people step over without seeing?",
  },
  {
    slug: "hong-kong-parr-martin-parr",
    blurb:
      "Parr in Hong Kong is color as noise — food, tourism, consumption, faces that meet the lens head-on. Less observation than collision; the book thrives on the city's appetite for being looked at.",
  },
  {
    slug: "pay-phone-daniel-weiss",
    blurb:
      "New York pay phones as ruins in plain sight. Weiss slows down a city that usually refuses stillness; obsolescence becomes portrait.",
    artistPrompt:
      "What public object in your city has outlived its original purpose?",
  },
  {
    slug: "play-space-north-kensington-19671969-adam-ritchie",
    blurb:
      "An adventure playground in North Kensington: children building worlds from scrap and permission. Street photography as sustained presence, not single theft.",
  },
  {
    slug: "soho-north-east-london-1980s1990s-2-books-tony-kearns",
    blurb:
      "Two Londons — Soho's night economy and east London's shifting edges — in one archival sweep. The sidewalk after dark as workplace and theater.",
  },
  {
    slug: "mixed-messages-paul-treacy",
    blurb:
      "Signs, slogans, masks, demonstrations: the street as reader and speaker. Treacy collects public language at the moment before it dissolves back into foot traffic.",
  },
  {
    slug: "pants-on-top-of-shoes-ivan-anisimov",
    blurb:
      "Tbilisi sidewalks with post-Soviet wit — bodies slightly wrong against the city, humor without softening.",
  },
  {
    slug: "derive-1-monnem-wahlheimat-sandra-koestler",
    blurb:
      "Psychogeographic drift in Mannheim; Wahlheimat — chosen homeland — as method. The street navigated by memory and displacement, not map.",
  },
  {
    slug: "la-polaroids-robby-muller",
    blurb:
      "The cinematographer's Los Angeles in Polaroid: parking lots, palms, the epic in the incidental. Instant film as sidewalk — immediate, then fixed in sequence.",
  },
];
