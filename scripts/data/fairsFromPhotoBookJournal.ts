/**
 * Photobook fairs sourced from PhotoBook Journal's international list:
 * https://photobookjournal.com/resources/book-fairs/
 *
 * Dates use official 2026 schedules where available; month-only listings use
 * typical timing for that event (verify on the fair website before travel).
 */

export type FairSeed = {
  name: string;
  slug: string;
  description: string;
  city: string;
  country: string;
  venue?: string;
  website?: string;
  startDate: Date;
  endDate: Date;
  coverUrl: string;
  status: "draft" | "published";
  approvalStatus: "pending" | "approved";
  listingTier: "free" | "promoted";
  promotedUntil?: Date;
  sortOrder: number;
};

const COVER =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800";

const DRAFT_DEFAULTS = {
  status: "draft" as const,
  approvalStatus: "pending" as const,
  listingTier: "free" as const,
};

/** Fairs from July 2026 onward (plus corrected entries for the full seed set). */
export const FAIRS_FROM_PHOTOBOOK_JOURNAL: FairSeed[] = [
  // --- July ---
  {
    name: "Les Rencontres d'Arles",
    slug: "rencontres-arles-2026",
    description:
      "The world's leading photography festival, with exhibitions, screenings, and photobook programming across Arles from opening week through autumn.",
    city: "Arles",
    country: "France",
    website: "https://www.rencontres-arles.com",
    startDate: new Date("2026-07-06"),
    endDate: new Date("2026-10-04"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 10,
  },
  {
    name: "Arles Books Fair",
    slug: "arles-books-fair-2026",
    description:
      "International photobook fair at the ENSP and Collège Saint-Charles, organized by France PhotoBook during the Rencontres d'Arles.",
    city: "Arles",
    country: "France",
    venue: "ENSP & Collège Saint-Charles",
    website: "https://francephotobook.fr/arles-books-fair/",
    startDate: new Date("2026-07-07"),
    endDate: new Date("2026-07-11"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 11,
  },
  {
    name: "Brooklyn Art Book Fair",
    slug: "brooklyn-art-book-fair-2026",
    description:
      "Free, volunteer-run fair showcasing publications and editioned works by underrepresented and emerging artists, writers, and publishers.",
    city: "Brooklyn",
    country: "USA",
    venue: "Recess & Garage Studios",
    website: "https://www.bkabf.info",
    startDate: new Date("2026-07-10"),
    endDate: new Date("2026-07-12"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 12,
  },
  {
    name: "San Francisco Art Book Fair",
    slug: "san-francisco-art-book-fair-2026",
    description:
      "Annual multi-day celebration of art publishing and print culture at Minnesota Street Project, bringing together independent publishers and artists from around the world.",
    city: "San Francisco",
    country: "USA",
    venue: "Minnesota Street Project",
    website: "https://sfartbookfair.com",
    startDate: new Date("2026-07-23"),
    endDate: new Date("2026-07-26"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 13,
  },
  {
    name: "StegoFoto",
    slug: "stegofoto-2026",
    description:
      "Santiago's photobook fair and meeting for Chilean and Latin American photobook publishers at Centro Cultural La Moneda.",
    city: "Santiago",
    country: "Chile",
    venue: "Centro Cultural La Moneda",
    website: "https://www.instagram.com/stgofotoferia",
    startDate: new Date("2026-07-30"),
    endDate: new Date("2026-08-02"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 14,
  },
  // --- August ---
  {
    name: "Photobook / NZ",
    slug: "photobook-nz-2026",
    description:
      "New Zealand's national photobook festival celebrating small-press photobooks, with a bookfair, workshops, and portfolio reviews at Te Papa.",
    city: "Wellington",
    country: "New Zealand",
    venue: "Te Papa",
    website: "https://www.photobooknz.com",
    startDate: new Date("2026-08-06"),
    endDate: new Date("2026-08-09"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 20,
  },
  // --- September ---
  {
    name: "Booklette",
    slug: "booklette-2026",
    description:
      "Swiss and international photobook fair held during the Biennale Images Vevey — books, raclette, and publisher signings.",
    city: "Vevey",
    country: "Switzerland",
    website: "https://www.images.ch/en/biennale/",
    startDate: new Date("2026-09-19"),
    endDate: new Date("2026-09-20"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 30,
  },
  {
    name: "Fiebre Photobook Festival",
    slug: "fiebre-photobook-festival-2026",
    description:
      "Madrid's photobook festival (Fever) at La Casa Encendida, bringing together publishers, artists, and collectors.",
    city: "Madrid",
    country: "Spain",
    venue: "La Casa Encendida",
    website: "https://www.lacasaencendida.es",
    startDate: new Date("2026-09-18"),
    endDate: new Date("2026-09-20"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 31,
  },
  {
    name: "Filter Photo Festival",
    slug: "filter-photo-festival-2026",
    description:
      "Chicago's annual photography festival, including photobook programming and exhibitions across the city. Dates approximate — check filterphoto.org.",
    city: "Chicago",
    country: "USA",
    website: "https://www.filterphoto.org",
    startDate: new Date("2026-09-10"),
    endDate: new Date("2026-09-13"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 32,
  },
  {
    name: "Brooklyn Book Festival",
    slug: "brooklyn-book-festival-2026",
    description:
      "Annual celebration of books and literary culture in Brooklyn, with author events and a street fair. Dates approximate — check brooklynbookfestival.org.",
    city: "Brooklyn",
    country: "USA",
    website: "https://www.brooklynbookfestival.org",
    startDate: new Date("2026-09-27"),
    endDate: new Date("2026-09-28"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 33,
  },
  {
    name: "NY Art Book Fair",
    slug: "ny-art-book-fair-2026",
    description:
      "The world's premier event for artists' books, catalogs, monographs, periodicals, and zines. Held at MoMA PS1, featuring publishers, booksellers, antiquarians, artists, and independent presses from around the world.",
    city: "New York",
    country: "USA",
    venue: "MoMA PS1",
    website: "https://printedmatterartbookfairs.org",
    startDate: new Date("2026-09-24"),
    endDate: new Date("2026-09-27"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 1,
  },
  {
    name: "Athens Art Book Fair",
    slug: "athens-art-book-fair-2026",
    description:
      "International art book fair at the Public Tobacco Factory in Athens, showcasing independent publishers and artists' books.",
    city: "Athens",
    country: "Greece",
    venue: "Public Tobacco Factory",
    website: "https://athensartbookfair.gr",
    startDate: new Date("2026-09-25"),
    endDate: new Date("2026-09-27"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 34,
  },
  // --- October ---
  {
    name: "Atlanta Center for Photography Book Fair",
    slug: "atlanta-center-for-photography-book-fair-2026",
    description:
      "Photobook fair hosted by Atlanta Center for Photography. Dates approximate — check acpinfo.org.",
    city: "Atlanta",
    country: "USA",
    website: "https://acpinfo.org",
    startDate: new Date("2026-10-10"),
    endDate: new Date("2026-10-11"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 40,
  },
  {
    name: "Frankfurter Buchmesse",
    slug: "frankfurter-buchmesse-2026",
    description:
      "Frankfurt Book Fair — the world's largest trade fair for books, with a substantial photobook and visual arts presence.",
    city: "Frankfurt",
    country: "Germany",
    website: "https://www.buchmesse.de",
    startDate: new Date("2026-10-14"),
    endDate: new Date("2026-10-18"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 41,
  },
  {
    name: "Palm Springs Photo Festival",
    slug: "palm-springs-photo-festival-2026",
    description:
      "Photography festival in Palm Springs with workshops, portfolio reviews, and photobook events. Dates approximate.",
    city: "Palm Springs",
    country: "USA",
    website: "https://www.palmspringsphotofestival.com",
    startDate: new Date("2026-10-22"),
    endDate: new Date("2026-10-25"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 42,
  },
  {
    name: "Vienna Art Book Fair",
    slug: "vienna-art-book-fair-2026",
    description:
      "International art book fair in Vienna. Dates approximate — check viennaartbookfair.com.",
    city: "Vienna",
    country: "Austria",
    website: "https://viennaartbookfair.com",
    startDate: new Date("2026-10-16"),
    endDate: new Date("2026-10-18"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 43,
  },
  // --- November ---
  {
    name: "Polycopies",
    slug: "polycopies-2026",
    description:
      "Parisian photobook fair on the Seine, coinciding with Paris Photo. Focus on self-published and independent photography books.",
    city: "Paris",
    country: "France",
    venue: "Bateau Concorde-Atlantique",
    website: "https://polycopies.net",
    startDate: new Date("2026-11-11"),
    endDate: new Date("2026-11-15"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 50,
  },
  {
    name: "Paris Photo",
    slug: "paris-photo-2026",
    description:
      "The world's largest international art fair dedicated to the photography medium. Paris Photo brings together the most important galleries, publishers, and artists from around the world at the Grand Palais.",
    city: "Paris",
    country: "France",
    venue: "Grand Palais",
    website: "https://www.parisphoto.com",
    startDate: new Date("2026-11-12"),
    endDate: new Date("2026-11-15"),
    coverUrl:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
    ...DRAFT_DEFAULTS,
    sortOrder: 2,
  },
  {
    name: "Offprint Paris",
    slug: "offprint-paris-2026",
    description:
      "Independent publishing fair in Paris, showcasing experimental and artist-run presses alongside Paris Photo week.",
    city: "Paris",
    country: "France",
    website: "https://www.offprint.org",
    startDate: new Date("2026-11-12"),
    endDate: new Date("2026-11-15"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 51,
  },
  {
    name: "Lisbon Photobook Fair",
    slug: "lisbon-photobook-fair-2026",
    description:
      "Annual photobook fair at the Arquivo Municipal de Lisboa – Fotográfico, celebrating independent photobook publishing.",
    city: "Lisbon",
    country: "Portugal",
    venue: "Arquivo Municipal de Lisboa – Fotográfico",
    website: "https://lisbonphotobookfair.com",
    startDate: new Date("2026-11-27"),
    endDate: new Date("2026-11-29"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 52,
  },
  {
    name: "Photobook Week Aarhus",
    slug: "photobook-week-aarhus-2026",
    description:
      "Danish photobook festival in Aarhus with exhibitions, talks, and a book market. Dates approximate.",
    city: "Aarhus",
    country: "Denmark",
    website: "https://www.photobookweek.dk",
    startDate: new Date("2026-11-06"),
    endDate: new Date("2026-11-08"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 53,
  },
  {
    name: "Center Photographic Fair",
    slug: "center-photographic-fair-2026",
    description:
      "Photobook fair at Center for Contemporary Photography in Santa Fe. Dates approximate.",
    city: "Santa Fe",
    country: "USA",
    website: "https://www.visitcenter.org",
    startDate: new Date("2026-11-14"),
    endDate: new Date("2026-11-15"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 54,
  },
  {
    name: "Silver Eye Book Fair",
    slug: "silver-eye-book-fair-2026",
    description:
      "Annual photobook fair at Silver Eye Center for Photography in Pittsburgh, featuring innovative publishers and artists.",
    city: "Pittsburgh",
    country: "USA",
    venue: "Silver Eye Center for Photography",
    website: "https://silvereye.org/events/bookfair",
    startDate: new Date("2026-11-06"),
    endDate: new Date("2026-11-07"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 55,
  },
  {
    name: "Staple + Stitch Art Book and Print Fair",
    slug: "staple-stitch-art-book-fair-2026",
    description:
      "Chicago art book and print fair featuring small presses, zine makers, workshops, and artist talks.",
    city: "Chicago",
    country: "USA",
    website: "https://www.stapleandstitchfair.com",
    startDate: new Date("2026-11-14"),
    endDate: new Date("2026-11-16"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 56,
  },
  // --- December ---
  {
    name: "PhotoNOLA",
    slug: "photonola-2026",
    description:
      "New Orleans photography festival with exhibitions, portfolio reviews, and a photobook market. Dates approximate.",
    city: "New Orleans",
    country: "USA",
    website: "https://www.photonola.org",
    startDate: new Date("2026-12-04"),
    endDate: new Date("2026-12-07"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 60,
  },
  {
    name: "SF Camerawork Holiday Book & Zine Fair",
    slug: "sf-camerawork-holiday-book-fair-2026",
    description:
      "Holiday season book and zine fair at SF Camerawork in San Francisco. Dates approximate.",
    city: "San Francisco",
    country: "USA",
    venue: "SF Camerawork",
    website: "https://www.sfcamerawork.org",
    startDate: new Date("2026-12-05"),
    endDate: new Date("2026-12-06"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 61,
  },
  {
    name: "Hot Stir Photobook Fair",
    slug: "hot-stir-photobook-fair-2026",
    description:
      "Taipei's photobook fair bringing together Asian and international photobook publishers. Dates approximate.",
    city: "Taipei",
    country: "Taiwan",
    website: "https://www.instagram.com/hotstirphotobookfair",
    startDate: new Date("2026-12-12"),
    endDate: new Date("2026-12-13"),
    coverUrl: COVER,
    ...DRAFT_DEFAULTS,
    sortOrder: 62,
  },
];
