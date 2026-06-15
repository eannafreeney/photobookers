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
