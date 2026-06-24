export type AboutCta = {
  label: string;
  href: string;
};

export type AboutAudienceSection = {
  id: "fans" | "artists" | "publishers";
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
  bullets: string[];
  closing: string;
  primaryCta: AboutCta;
  secondaryCtas: AboutCta[];
};

export const aboutPageMeta = {
  title: "The place to discover photobooks",
  intro:
    "Photobookers brings books, artists, publishers, and book fairs together — so fans can find what matters, and creators can be found by people who care.",
  lead:
    "The photobook is one of photography's most enduring forms. But great books are scattered across small presses, artist shops, and corners of the internet. Photobookers gathers them in one curated place — with editorial features, fair listings, and tools for the people who make and collect them.",
} as const;

export const aboutAudienceNav = [
  { id: "fans", label: "For fans" },
  { id: "artists", label: "For artists" },
  { id: "publishers", label: "For publishers" },
] as const;

export const aboutAudienceSections: AboutAudienceSection[] = [
  {
    id: "fans",
    navLabel: "For fans",
    kicker: "For fans",
    title: "Find books you didn't know you were looking for",
    intro:
      "Whether you collect photobooks or are just getting started, photobookers is built for browsing — not just searching.",
    bullets: [
      "Browse the whole world of photobooks — search and explore by artist, publisher, tag, and fair.",
      "Follow the people behind the books — save titles to your wishlist and build a collection that reflects your taste.",
      "Stay in the loop — get updates when creators you follow publish new work.",
      "Discover through curation — Book of the Day, Artist and Publisher of the Week, and interviews with the people shaping the field.",
      "Book fairs, in one place — see upcoming fairs, who's attending, and connect what you saw at a fair with what you can find online.",
    ],
    closing:
      "You don't need to know what you want before you arrive. Come to browse, follow what catches your eye, and let your collection grow over time.",
    primaryCta: { label: "Create a free account", href: "/auth/accounts" },
    secondaryCtas: [
      { label: "Browse books", href: "/books" },
      { label: "Join the newsletter", href: "/newsletter" },
    ],
  },
  {
    id: "artists",
    navLabel: "For artists",
    kicker: "For artists",
    title: "Your work, visible alongside the photobook world",
    intro:
      "A profile on photobookers ties your name to your books — and puts you in context with the artists and publishers collectors already trust.",
    bullets: [
      "A home for your books — list your titles with covers, details, and links to buy.",
      "Be found in search and features — when someone browses by tag, publisher, or fair, your books show up.",
      "Reach people who are already looking — photobookers attracts collectors and curious readers, not random traffic.",
      "Share your story — interviews and features give context to your work beyond the cover image.",
      "See what's working — analytics show views, clicks, wishlists, and collections on your books.",
    ],
    closing:
      "You keep control: your shop, your links, your terms. We help the right people find you.",
    primaryCta: { label: "Create a creator account", href: "/auth/register-creator" },
    secondaryCtas: [{ label: "Get in touch", href: "/contact" }],
  },
  {
    id: "publishers",
    navLabel: "For publishers",
    kicker: "For publishers",
    title: "Your catalog, discoverable by the people who buy photobooks",
    intro:
      "Photobookers is where serious collectors browse. List your catalog once, show up in search and fairs, and see the traffic you are driving.",
    bullets: [
      "Your full catalog in one place — list books individually or import your backlist by CSV.",
      "Discovery beyond your own site — fans find your titles while browsing other artists, publishers, and fairs.",
      "Proof it's working — creator analytics show views, outbound purchase clicks, wishlists, and collections.",
      "Show up at book fairs — list fairs you attend and connect your catalog to the event.",
      "Editorial exposure — Book of the Day, Publisher of the Week, and interviews put your list in front of an engaged audience.",
    ],
    closing:
      "We are building the place publishers need to be seen — not just listed. Start with your catalog; grow with the community.",
    primaryCta: { label: "Create a publisher account", href: "/auth/register-creator" },
    secondaryCtas: [{ label: "Get help importing your catalog", href: "/contact" }],
  },
];

export const aboutDifferentiators = {
  kicker: "Why here",
  title: "A hub, not a dump",
  body: "Photobookers is not trying to list every book on the internet. It is a curated gathering place for photobook culture — discovery, fairs, interviews, and the people behind the work. That matters for fans because browsing here means something. It matters for artists and publishers because being here signals you belong to that world.",
  pillars: [
    {
      title: "Curation",
      description: "Editorial features and selective listing — quality over quantity.",
    },
    {
      title: "Community",
      description: "Follows, collections, fairs, and interviews — people, not just products.",
    },
    {
      title: "Rhythm",
      description: "Book of the Day, weekly features, and the newsletter — reasons to come back.",
    },
  ],
} as const;

export const aboutEditorialLinks = [
  { label: "Book of the Day", href: "/book-of-the-day" },
  { label: "Artist of the Week", href: "/artist-of-the-week" },
  { label: "Publisher of the Week", href: "/publisher-of-the-week" },
  { label: "interviews", href: "/interviews" },
  { label: "newsletter", href: "/newsletter" },
] as const;
