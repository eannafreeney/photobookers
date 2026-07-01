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

export function buildNewlyVerifiedCreatorInstagramCaption(
  creator: CreatorSpotlightForCaption & {
    type: "artist" | "publisher";
    tagline?: string | null;
  },
): string {
  const role = creator.type === "artist" ? "Artist" : "Publisher";
  const lines = ["New on photobookers", "", creator.displayName, role];
  const blurb = creator.tagline?.trim() || creator.bio?.trim();
  if (blurb) lines.push("", blurb);
  const handle = formatInstagramHandle(creator.instagram);
  if (handle) lines.push("", handle);
  lines.push("", "#photobook #photobookjousting", "", "Link in bio →");
  return lines.join("\n");
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

/** Instagram handles for BOTD story sticker copy (artist, then publisher). */
export function buildBotdStoryHandles(book: BookForCaption): string {
  const handles = [book.artist, book.publisher]
    .map((creator) => formatInstagramHandle(creator?.instagram))
    .filter((handle): handle is string => Boolean(handle));

  return handles.join("\n");
}

function buildBotdArtistDmSticker(book: BookForCaption): string | null {
  if (!book.artist?.displayName) return null;
  return [
    `Hi! Your book "${book.title}" was Book of the Day on photobookers.com.`,
    buildBookPageUrl(book.slug),
  ].join("\n");
}

function buildBotdPublisherDmSticker(book: BookForCaption): string | null {
  if (!book.publisher?.displayName) return null;
  const artistName = book.artist?.displayName ?? "the artist";
  return [
    `Hi! "${book.title}" by ${artistName} was Book of the Day on photobookers.com.`,
    buildBookPageUrl(book.slug),
  ].join("\n");
}

/** Copy-paste sticker fields for BOTD feed posts (notification reminder). */
export function buildBotdPostStickerFields(book: BookForCaption): {
  text: string;
  products?: string;
} {
  const dms = [
    buildBotdArtistDmSticker(book),
    buildBotdPublisherDmSticker(book),
  ].filter((dm): dm is string => Boolean(dm));
  const products = buildBotdStoryHandles(book);
  return {
    text: dms.join("\n\n"),
    ...(products ? { products } : {}),
  };
}

/** Story sticker fields for BOTD — artist and publisher DMs only. */
export function buildBotdStoryStickerFields(book: BookForCaption): {
  text: string;
  topics?: string;
} {
  const artistDm = buildBotdArtistDmSticker(book);
  const publisherDm = buildBotdPublisherDmSticker(book);

  if (artistDm && publisherDm) {
    return { text: artistDm, topics: publisherDm };
  }
  if (artistDm) return { text: artistDm };
  if (publisherDm) return { text: publisherDm };
  return { text: "Book of the Day" };
}

type SpotlightMention = {
  displayName: string;
  instagram?: string | null;
  role?: string;
};

/** Story sticker text for AOTW / POTW — caption plus @mention hints. */
export function buildSpotlightStoryStickerText(
  caption: string,
  mentions: SpotlightMention[],
): string {
  const trimmed = caption.trim();
  const mentionLines = mentions
    .map((mention) => {
      const handle = formatInstagramHandle(mention.instagram);
      if (!handle) return null;
      const roleLabel = mention.role ? ` (${mention.role})` : "";
      return `${handle}${roleLabel} — ${mention.displayName}`;
    })
    .filter((line): line is string => Boolean(line));

  if (mentionLines.length === 0) return trimmed;

  const mentionBlock = ["", "Mention:", ...mentionLines].join("\n");
  const linkMarker = "Link in bio";
  const linkIdx = trimmed.indexOf(linkMarker);
  if (linkIdx >= 0) {
    const before = trimmed.slice(0, linkIdx).trimEnd();
    const after = trimmed.slice(linkIdx).trim();
    return `${before}${mentionBlock}\n\n${after}`;
  }

  return `${trimmed}${mentionBlock}`;
}

/** Copy-paste sticker text for AOTW feed posts (notification reminder). */
export function buildArtistPostStickerText(
  creator: CreatorSpotlightForCaption,
): string {
  const handle = formatInstagramHandle(creator.instagram);
  const greeting = handle
    ? `Hi ${handle}! You were Artist of the Week on photobookers.com.`
    : `Hi! You were Artist of the Week on photobookers.com.`;
  return [greeting, buildCreatorPageUrl(creator.slug)].join("\n");
}

/** Copy-paste sticker text for POTW feed posts (notification reminder). */
export function buildPublisherPostStickerText(
  creator: CreatorSpotlightForCaption,
): string {
  const handle = formatInstagramHandle(creator.instagram);
  const greeting = handle
    ? `Hi ${handle}! You were Publisher of the Week on photobookers.com.`
    : `Hi! You were Publisher of the Week on photobookers.com.`;
  return [greeting, buildCreatorPageUrl(creator.slug)].join("\n");
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

export function collectCreatorImageOptions(
  creator: { coverUrl: string | null },
  bookCoverUrls: string[] = [],
): string[] {
  const urls = new Set<string>();
  if (creator.coverUrl) urls.add(creator.coverUrl);
  for (const url of bookCoverUrls) {
    if (url) urls.add(url);
  }
  return [...urls];
}
