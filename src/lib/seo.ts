import { BookWithGalleryImages } from "../features/app/types";

export const SITE_NAME = "photobookers";

export const DEFAULT_DESCRIPTION =
  "Discover and explore photobooks. Browse books, artists, and publishers in one place.";

export function pageTitle(title: string): string {
  if (title.toLowerCase().includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

export function canonicalUrl(requestUrl: string, path: string): string {
  return new URL(path, requestUrl).href;
}

export function truncateDescription(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

export function bookPageTitle(
  title: string,
  artistName?: string | null,
): string {
  if (artistName) return pageTitle(`${title} by ${artistName}`);
  return pageTitle(title);
}

export function bookDescription(book: {
  title: string;
  description?: string | null;
  artist?: { displayName: string } | null;
}): string {
  if (book.description) return truncateDescription(book.description);
  const artist = book.artist?.displayName;
  if (artist) {
    return truncateDescription(
      `${book.title} by ${artist}. Discover this photobook on photobookers.`,
    );
  }
  return truncateDescription(`Discover ${book.title} on photobookers.`);
}

export function creatorDescription(creator: {
  displayName: string;
  tagline?: string | null;
  bio?: string | null;
  type: string;
}): string {
  const source = creator.tagline || creator.bio;
  if (source) return truncateDescription(`${creator.displayName} — ${source}`);
  const label = creator.type === "publisher" ? "publisher" : "artist";
  return truncateDescription(
    `Explore photobooks by ${creator.displayName}, a ${label} on photobookers.`,
  );
}

export function shelfDescription(ownerName: string, bookCount: number): string {
  const countLabel =
    bookCount === 1 ? "1 favorite photobook" : `${bookCount} favorite photobooks`;
  return truncateDescription(
    `Explore ${countLabel} on ${ownerName}'s shelf on photobookers.`,
  );
}

export function tagDescription(tagLabel: string): string {
  return truncateDescription(
    `Browse ${tagLabel.toLowerCase()} photobooks on Photobookers — discover titles, artists, and publishers in one place.`,
  );
}

type BookJsonLdInput = {
  title: string;
  description?: string | null;
  slug: string;
  coverUrl?: string | null;
  canonicalUrl: string;
  artist?: { displayName: string } | null;
  publisher?: { displayName: string } | null;
};

export function buildBookJsonLd(
  book: BookWithGalleryImages,
  canonicalUrl: string,
) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: canonicalUrl,
  };

  if (book.description) {
    jsonLd.description = truncateDescription(book.description, 500);
  }

  if (book.coverUrl) {
    jsonLd.image = book.coverUrl;
  }

  if (book.artist?.displayName) {
    jsonLd.author = {
      "@type": "Person",
      name: book.artist.displayName,
    };
  }

  if (book.publisher?.displayName) {
    jsonLd.publisher = {
      "@type": "Organization",
      name: book.publisher.displayName,
    };
  }

  return jsonLd;
}

type FairJsonLdInput = {
  name: string;
  description?: string | null;
  slug: string;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  canonicalUrl: string;
  startDate: Date;
  endDate: Date;
  city?: string | null;
  country?: string | null;
  venue?: string | null;
  website?: string | null;
};

export function buildFairJsonLd(fair: FairJsonLdInput) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: fair.name,
    url: fair.canonicalUrl,
    startDate: fair.startDate.toISOString(),
    endDate: fair.endDate.toISOString(),
  };

  if (fair.description) {
    jsonLd.description = truncateDescription(fair.description, 500);
  }

  if (fair.coverUrl || fair.bannerUrl) {
    jsonLd.image = fair.bannerUrl || fair.coverUrl;
  }

  // Location
  const hasLocation = fair.venue || fair.city || fair.country;
  if (hasLocation) {
    const location: Record<string, unknown> = {
      "@type": "Place",
    };

    if (fair.venue) {
      location.name = fair.venue;
    }

    const hasAddress = fair.city || fair.country;
    if (hasAddress) {
      const address: Record<string, unknown> = {
        "@type": "PostalAddress",
      };

      if (fair.city) {
        address.addressLocality = fair.city;
      }

      if (fair.country) {
        address.addressCountry = fair.country;
      }

      location.address = address;
    }

    jsonLd.location = location;
  }

  if (fair.website) {
    jsonLd.sameAs = fair.website;
  }

  // Event status - all published fairs are scheduled
  jsonLd.eventStatus = "https://schema.org/EventScheduled";

  // Event attendance mode - assume offline (physical event)
  jsonLd.eventAttendanceMode = "https://schema.org/OfflineEventAttendanceMode";

  return jsonLd;
}

export type StoreJsonLdInput = {
  name: string;
  description?: string | null;
  canonicalUrl: string;
  imageUrl?: string | null;
  address: string;
  city: string;
  country: string;
  website?: string | null;
};

export function buildStoreJsonLd(store: StoreJsonLdInput) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BookStore",
    name: store.name,
    url: store.canonicalUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: store.country,
    },
  };

  if (store.description) {
    jsonLd.description = truncateDescription(store.description, 500);
  }

  if (store.imageUrl) {
    jsonLd.image = store.imageUrl;
  }

  if (store.website) {
    jsonLd.sameAs = store.website;
  }

  return jsonLd;
}
