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
