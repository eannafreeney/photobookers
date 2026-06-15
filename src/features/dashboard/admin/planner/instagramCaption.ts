const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

type CreatorForCaption = {
  displayName: string;
  instagram?: string | null;
};

type BookForCaption = {
  title: string;
  slug: string;
  artist?: CreatorForCaption | null;
  publisher?: CreatorForCaption | null;
  tags?: string[] | null;
};

export function buildBookPageUrl(slug: string): string {
  return `${appBaseUrl}/books/${slug}`;
}

export function buildCreatorPageUrl(slug: string): string {
  return `${appBaseUrl}/creators/${slug}`;
}

export type CreatorSpotlightForCaption = {
  displayName: string;
  slug: string;
  instagram?: string | null;
  bio?: string | null;
};

export function buildDefaultArtistInstagramCaption(
  creator: CreatorSpotlightForCaption,
): string {
  return buildDefaultCreatorSpotlightInstagramCaption(creator, "artist");
}

export function buildDefaultPublisherInstagramCaption(
  creator: CreatorSpotlightForCaption,
): string {
  return buildDefaultCreatorSpotlightInstagramCaption(creator, "publisher");
}

function buildDefaultCreatorSpotlightInstagramCaption(
  creator: CreatorSpotlightForCaption,
  type: "artist" | "publisher",
): string {
  const label =
    type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const lines = [label, "", creator.displayName];
  if (creator.bio?.trim()) {
    lines.push("", creator.bio.trim());
  }
  const handle = formatInstagramHandle(creator.instagram);
  if (handle) lines.push("", handle);
  lines.push("", "#photobook #photobookjousting", "", "Link in bio →");
  return lines.join("\n");
}

export function buildDefaultCreatorInstagramFirstComment(creator: {
  slug: string;
}): string {
  return buildCreatorPageUrl(creator.slug);
}

/** Normalizes stored instagram URL or handle to `@username` for captions. */
export function formatInstagramHandle(
  instagram: string | null | undefined,
): string | null {
  if (!instagram?.trim()) return null;

  const raw = instagram.trim();
  const urlMatch = raw.match(/instagram\.com\/([^/?#]+)/i);
  const handle = (urlMatch?.[1] ?? raw)
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    ?.trim();

  if (!handle) return null;
  return `@${handle}`;
}

/** e.g. ["still life", "urban"] → "#stilllife #urban" */
export function formatInstagramHashtags(
  tags: string[] | null | undefined,
): string | null {
  if (!tags?.length) return null;

  const hashtags = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .map((tag) => `#${tag.replace(/\s+/g, "")}`);

  if (hashtags.length === 0) return null;
  return hashtags.join(" ");
}

function captionIncludesAllHashtags(
  caption: string,
  tags: string[] | null | undefined,
): boolean {
  const tagLine = formatInstagramHashtags(tags);
  if (!tagLine) return true;
  return tagLine.split(" ").every((hashtag) => caption.includes(hashtag));
}

/** Appends book hashtags when missing (e.g. captions saved before tags existed). */
export function ensureBookTagsInCaption(
  caption: string,
  tags: string[] | null | undefined,
): string {
  const tagLine = formatInstagramHashtags(tags);
  if (!tagLine) return caption.trim();

  const trimmed = caption.trim();
  if (!trimmed) return tagLine;
  if (captionIncludesAllHashtags(trimmed, tags)) return trimmed;

  const linkMarker = "Link in bio";
  const linkIdx = trimmed.indexOf(linkMarker);
  if (linkIdx >= 0) {
    const before = trimmed.slice(0, linkIdx).trimEnd();
    const after = trimmed.slice(linkIdx).trim();
    return before
      ? `${before}\n\n${tagLine}\n\n${after}`
      : `${tagLine}\n\n${after}`;
  }

  return `${trimmed}\n\n${tagLine}`;
}

export function buildBotdInstagramCaption(
  book: BookForCaption,
  storedCaption?: string | null,
): string {
  if (!storedCaption?.trim()) {
    return buildDefaultInstagramCaption(book);
  }
  return ensureBookTagsInCaption(storedCaption, book.tags);
}

export function buildDefaultInstagramCaption(book: BookForCaption): string {
  const lines = ["Book of the Day", "", book.title];

  if (book.artist?.displayName) {
    const artistHandle = formatInstagramHandle(book.artist.instagram);
    lines.push(
      `by ${book.artist.displayName}${artistHandle ? ` ${artistHandle}` : ""}`,
    );
  }

  if (book.publisher?.displayName) {
    const publisherHandle = formatInstagramHandle(book.publisher.instagram);
    lines.push(
      `Published by ${book.publisher.displayName}${publisherHandle ? ` ${publisherHandle}` : ""}`,
    );
  }

  const tagLine = formatInstagramHashtags(book.tags);
  if (tagLine) lines.push("", tagLine);

  lines.push("", "#photobook #photobookjousting", "", "Link in bio →");

  return lines.map((line) => line.trim()).join("\n");
}

/** First comment — Instagram renders URLs here as clickable links. */
export function buildDefaultInstagramFirstComment(book: {
  slug: string;
}): string {
  return buildBookPageUrl(book.slug);
}

export function collectBookImageOptions(book: {
  coverUrl: string | null;
  images?: { imageUrl: string }[];
}): string[] {
  const urls = new Set<string>();
  if (book.coverUrl) urls.add(book.coverUrl);
  for (const image of book.images ?? []) {
    if (image.imageUrl) urls.add(image.imageUrl);
  }
  return [...urls];
}

export function collectCreatorImageOptions(creator: {
  coverUrl: string | null;
}): string[] {
  return creator.coverUrl ? [creator.coverUrl] : [];
}
