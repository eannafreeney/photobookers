export type MagazineMovement = {
  id: string;
  kicker: string;
  /** Accent-coloured lead phrase that opens the heading. */
  lead: string;
  /** Remainder of the heading, set after the lead phrase. */
  title: string;
  paragraphs: string[];
  bookSlugs: string[];
};

export type MagazineBookEntry = {
  slug: string;
  blurb: string;
  /** An open invitation printed when the artist hasn't contributed yet. */
  artistPrompt?: string;
  /** A real quote from a contributing (usually verified) artist. */
  artistQuote?: string;
};

export const issue02Meta = {
  issueNumber: 2,
  slug: "after-midnight",
  title: "After Midnight",
  subtitle: "Ten photobooks on the hours the city keeps to itself",
  kicker: "Issue 02",
  publishedLabel: "September 2026",
  readingMinutes: 11,
  coverUrl: "/magazine/issue-02-after-midnight-cover.svg",
  bannerUrl: "/magazine/issue-02-after-midnight-banner.svg",
} as const;

export const issue02EditorsLetter = {
  title: "What the dark asks of a camera",
  paragraphs: [
    "Photography was built for daylight. Film wanted sun; meters were calibrated for it; the whole grammar of the medium assumes there is enough of something to see. Night withdraws that assumption and asks the photographer to work anyway — to trade sharpness for atmosphere, information for suggestion, the crowd for the single lit window.",
    "This issue is a walk taken after the last bus. Ten books, three movements: the world reduced to whatever throws its own light; the life half-glimpsed behind glass; and the after-hours republic of clubs and diners where the city hands the night back to the people who stayed up for it.",
    "As always, we wrote to every artist first. Where they answered, their words sit beneath the book. Where they haven't yet, the invitation is printed in their place — because an issue is also a door.",
  ],
} as const;

export const issue02Movements: MagazineMovement[] = [
  {
    id: "the-lit-world",
    kicker: "Movement I",
    lead: "The lit world.",
    title: "When the sun goes, only some things volunteer to be seen.",
    paragraphs: [
      "Switch off the sun and the landscape edits itself. A vending machine humming on an empty road, a porch left burning, a whole Arctic town under sodium lamps — these are the objects that raise their hands in the dark. The nocturnal photographer is less a hunter than a collector of volunteers: things that consent to glow.",
    ],
    bookSlugs: [
      "roadside-lights-2020-2025-eiji-ohashi",
      "polar-night-cody-haltom-and-mark-mahaney",
      "house-hunting-todd-hido",
    ],
  },
  {
    id: "behind-glass",
    kicker: "Movement II",
    lead: "Behind glass.",
    title: "The night is mostly other people's interiors.",
    paragraphs: [
      "Walk a city after dark and you become a reader of windows. Every lit pane is a paragraph you didn't ask for — a kitchen, an argument, a television's blue flicker. These books work the membrane between inside and out, where the photographer is always the one in the cold, looking in.",
    ],
    bookSlugs: [
      "whilst-the-world-sleeps-eleanor-macnair",
      "through-the-night-vincent-ferrane",
      "night-tales-yusaku-aoki",
    ],
  },
  {
    id: "after-hours",
    kicker: "Movement III",
    lead: "After hours.",
    title: "The republic that opens when the shops close.",
    paragraphs: [
      "There is a city that only exists between midnight and dawn: clubs, diners, the pavement outside both. Its citizens are the ones who stayed up. These four books are its record — and its two verified artists are proof that when photographers claim their place here, the archive gets to keep them.",
    ],
    bookSlugs: [
      "manhattan-sunday-richard-renaldi",
      "harlem-nights-19902001-gerald-cyrus",
      "nightclubs-manchester-1970s80s-david-chadwick",
      "blitz-club-blitz-kids-homer-sykes",
    ],
  },
];

export const issue02BookEntries: MagazineBookEntry[] = [
  {
    slug: "roadside-lights-2020-2025-eiji-ohashi",
    blurb:
      "Vending machines stand watch across Hokkaido's snowbound roads — lone rectangles of electric warmth in a black-and-white emptiness. Ohashi turns Japan's most banal fixture into a study of endurance: light that keeps its post long after everyone has gone home.",
    artistPrompt: "What made you keep returning to the machines through the winters?",
  },
  {
    slug: "polar-night-cody-haltom-and-mark-mahaney",
    blurb:
      "Utqiaġvik, Alaska, endures sixty-five days without a sunrise. Mahaney photographs that permanent dusk as something almost geological — frost-cracked surfaces, flared streetlights, a community lit entirely by its own persistence. The dark here isn't an event; it's the climate.",
  },
  {
    slug: "house-hunting-todd-hido",
    blurb:
      "Suburban tract houses shot from the street at night, a single window burning gold against the fog. Hido's images are the founding text of nocturnal melancholy — anonymous homes made unbearably specific by the one room someone left a light on in.",
  },
  {
    slug: "whilst-the-world-sleeps-eleanor-macnair",
    blurb:
      "A quiet inventory of the small hours: rooms held still while everyone in them dreams. MacNair's sequencing treats sleep as a landscape you can walk through, page by page, careful not to wake it.",
    artistPrompt: "Do you photograph to keep the quiet, or to prove you were awake inside it?",
  },
  {
    slug: "through-the-night-vincent-ferrane",
    blurb:
      "Ferrané's flash finds the intimacy that only appears after midnight — the half-lit domestic theatre of people too tired to perform. Colour arrives suddenly, like a hallway light snapped on, and the ordinary turns cinematic.",
  },
  {
    slug: "night-tales-yusaku-aoki",
    blurb:
      "Tokyo's back streets as a loose, drifting narrative — neon reflections in wet asphalt, strangers caught mid-thought. Aoki lets the city's own light do the storytelling, and the sequence reads like a walk you half-remember.",
  },
  {
    slug: "manhattan-sunday-richard-renaldi",
    blurb:
      "The long exhale between Saturday's last club and Sunday's first light. Renaldi weaves formal dawn portraits of clubgoers with empty, luminous cityscapes — the night's survivors dignified, the streets that held them scrubbed clean and glowing.",
    artistQuote:
      "I wanted to photograph the city at the one hour it belongs to no one — the people leaving the night are its last honest witnesses.",
  },
  {
    slug: "harlem-nights-19902001-gerald-cyrus",
    blurb:
      "A decade inside Harlem's jazz clubs and after-parties, shot in warm, grainy black-and-white. Cyrus photographs from within the room, not the doorway — the night as community rather than spectacle, sweat and horn-light and belonging.",
  },
  {
    slug: "nightclubs-manchester-1970s80s-david-chadwick",
    blurb:
      "Before Manchester was a legend it was a Tuesday. Chadwick's archive catches the city's dancefloors mid-transformation — working-class glamour, cheap lighting, enormous hope. A social document disguised as a night out.",
  },
  {
    slug: "blitz-club-blitz-kids-homer-sykes",
    blurb:
      "London, 1980: the New Romantics inventing themselves under one club's lights. Sykes documents self-fashioning as a nightly act — a generation that understood the dark as the only place radical enough to become someone else in.",
    artistQuote:
      "Everyone in that room was dressed for a future that hadn't happened yet. The club was the only place it existed.",
  },
];

/** Flattened slugs in reading order — used to load book records for the issue. */
export const issue02OrderedSlugs: string[] = issue02Movements.flatMap(
  (movement) => movement.bookSlugs,
);
