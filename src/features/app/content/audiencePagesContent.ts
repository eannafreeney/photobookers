import { SITE_SKOOL } from "../../../constants/siteSocial";
import type { AboutCta } from "./aboutPageContent";

export type AudienceFeature = {
  title: string;
  description: string;
};

export type AudienceBenefit = {
  title: string;
  description: string;
};

export type AudiencePageId = "collectors" | "artists" | "publishers";

export type AudiencePageContent = {
  id: AudiencePageId;
  path: `/for-${AudiencePageId}`;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  intro: string;
  featuresKicker: string;
  featuresTitle: string;
  features: AudienceFeature[];
  benefitsKicker: string;
  benefitsTitle: string;
  benefits: AudienceBenefit[];
  closing: string;
  primaryCta: AboutCta;
  secondaryCtas: AboutCta[];
};

export const audiencePagesNav: {
  id: AudiencePageId;
  label: string;
  href: `/for-${AudiencePageId}`;
}[] = [
  { id: "collectors", label: "For collectors", href: "/for-collectors" },
  { id: "artists", label: "For artists", href: "/for-artists" },
  { id: "publishers", label: "For publishers", href: "/for-publishers" },
];

export const audiencePages: Record<AudiencePageId, AudiencePageContent> = {
  collectors: {
    id: "collectors",
    path: "/for-collectors",
    navLabel: "For collectors",
    metaTitle: "For collectors",
    metaDescription:
      "Discover photobooks, follow artists and publishers, build a public shelf, and keep up with book fairs — free on Photobookers.",
    kicker: "For collectors",
    title: "Find books you didn't know you were looking for",
    intro:
      "Whether you collect photobooks or are just getting started, Photobookers is built for browsing — not just searching. One place for books, creators, fairs, and the people who love them.",
    featuresKicker: "Features",
    featuresTitle: "What you can do",
    features: [
      {
        title: "Browse the photobook world",
        description:
          "Search and explore by artist, publisher, tag, and fair — without needing a title in mind before you arrive.",
      },
      {
        title: "Favourites and a public shelf",
        description:
          "Save titles you love and share a shelf that reflects your taste. Other collectors can follow along.",
      },
      {
        title: "Follow creators and collectors",
        description:
          "Get updates when artists and publishers you follow publish new work, and follow other collectors for their posts.",
      },
      {
        title: "Editorial discovery",
        description:
          "Book of the Day, Artist and Publisher of the Week, and interviews — curation that surfaces work worth your time.",
      },
      {
        title: "Book fairs in one place",
        description:
          "See upcoming fairs, who's attending, and connect what you saw at a fair with what you can find online.",
      },
    ],
    benefitsKicker: "Why it matters",
    benefitsTitle: "Built for how collectors actually browse",
    benefits: [
      {
        title: "Discovery over search",
        description:
          "Great photobooks are easy to miss when they live on scattered shops and small presses. We gather them so browsing can lead somewhere.",
      },
      {
        title: "Taste, made visible",
        description:
          "Your shelf and follows turn private collecting into something you can share — and learn from others.",
      },
      {
        title: "A reason to come back",
        description:
          "Daily and weekly features, plus the newsletter, keep the photobook world in motion without the noise.",
      },
    ],
    closing:
      "You don't need to know what you want before you arrive. Come to browse, follow what catches your eye, and let your shelf grow over time.",
    primaryCta: { label: "Create a free account", href: "/auth/accounts" },
    secondaryCtas: [
      { label: "Browse books", href: "/books" },
      { label: "Join the newsletter", href: "/newsletter" },
    ],
  },
  artists: {
    id: "artists",
    path: "/for-artists",
    navLabel: "For artists",
    metaTitle: "For artists",
    metaDescription:
      "List your photobooks, reach collectors who are already looking, and see what's working — free creator tools on Photobookers.",
    kicker: "For artists",
    title: "Your work, visible alongside the photobook world",
    intro:
      "A profile on Photobookers ties your name to your books — and puts you in context with the artists and publishers collectors already trust.",
    featuresKicker: "Features",
    featuresTitle: "What you can do",
    features: [
      {
        title: "A home for your books",
        description:
          "List your titles with covers, details, and links to buy. You keep your shop, your links, your terms.",
      },
      {
        title: "Be found in search and features",
        description:
          "When someone browses by tag, publisher, or fair, your books show up where collectors are already looking.",
      },
      {
        title: "Reach people who care",
        description:
          "Photobookers attracts collectors and curious readers — not random traffic. Context matters as much as clicks.",
      },
      {
        title: "Share your story",
        description:
          "Interviews and editorial features give context to your work beyond the cover image.",
      },
      {
        title: "See what's working",
        description:
          "Analytics show views, purchase clicks, favourites, and collections on your books.",
      },
    ],
    benefitsKicker: "Why it matters",
    benefitsTitle: "Visibility without giving up control",
    benefits: [
      {
        title: "Context, not a listing dump",
        description:
          "Sitting next to trusted artists and publishers signals that you belong to the photobook world — not just another product page.",
      },
      {
        title: "Discovery beyond your own site",
        description:
          "Collectors find you while browsing other creators, fairs, and features — paths your own shop can't open alone.",
      },
      {
        title: "Feedback you can use",
        description:
          "Views, clicks, and favourites show which titles resonate so you can decide what to promote next.",
      },
    ],
    closing:
      "You keep control: your shop, your links, your terms. We help the right people find you.",
    primaryCta: {
      label: "Create a creator account",
      href: "/auth/register-creator",
    },
    secondaryCtas: [
      {
        label: "Working on a photobook?",
        href: SITE_SKOOL.href,
        external: true,
      },
      { label: "Get in touch", href: "/contact" },
    ],
  },
  publishers: {
    id: "publishers",
    path: "/for-publishers",
    navLabel: "For publishers",
    metaTitle: "For publishers",
    metaDescription:
      "List your catalog, show up in search and fairs, and track purchase clicks — Photobookers for photobook publishers.",
    kicker: "For publishers",
    title: "Your catalog, discoverable by the people who buy photobooks",
    intro:
      "Photobookers is where serious collectors browse. List your catalog once, show up in search and fairs, and see the traffic you are driving.",
    featuresKicker: "Features",
    featuresTitle: "What you can do",
    features: [
      {
        title: "Your full catalog in one place",
        description:
          "List books individually or import your backlist by CSV — then keep covers, details, and buy links up to date.",
      },
      {
        title: "Discovery beyond your own site",
        description:
          "Collectors find your titles while browsing other artists, publishers, and fairs — not only when they already know your name.",
      },
      {
        title: "Proof it's working",
        description:
          "Creator analytics show views, outbound purchase clicks, favourites, and collections across your list.",
      },
      {
        title: "Show up at book fairs",
        description:
          "List fairs you attend and connect your catalog to the event so visitors can find your books after the fair.",
      },
      {
        title: "Editorial exposure",
        description:
          "Book of the Day, Publisher of the Week, and interviews put your list in front of an engaged audience.",
      },
    ],
    benefitsKicker: "Why it matters",
    benefitsTitle: "Seen by collectors, not just listed online",
    benefits: [
      {
        title: "A curated audience",
        description:
          "People come here to browse photobooks. That intent is hard to buy and harder to recreate on a general marketplace.",
      },
      {
        title: "One catalog, many paths in",
        description:
          "Search, tags, fairs, follows, and editorial features all point back to your titles without rebuilding discovery yourself.",
      },
      {
        title: "Clear signals",
        description:
          "Outbound clicks and favourites tell you which books are earning attention — useful for stock, reprints, and promotion.",
      },
    ],
    closing:
      "We are building the place publishers need to be seen — not just listed. Start with your catalog; grow with the community.",
    primaryCta: {
      label: "Create a publisher account",
      href: "/auth/register-creator",
    },
    secondaryCtas: [
      { label: "Get help importing your catalog", href: "/contact" },
    ],
  },
};
