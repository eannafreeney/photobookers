const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";
function buildBookPageUrl(slug) {
  return `${appBaseUrl}/books/${slug}`;
}
function buildCreatorPageUrl(slug) {
  return `${appBaseUrl}/creators/${slug}`;
}
function buildDefaultArtistInstagramCaption(creator) {
  return buildDefaultCreatorSpotlightInstagramCaption(creator, "artist");
}
function buildDefaultPublisherInstagramCaption(creator) {
  return buildDefaultCreatorSpotlightInstagramCaption(creator, "publisher");
}
function buildDefaultCreatorSpotlightInstagramCaption(creator, type) {
  const label = type === "artist" ? "Artist of the Week" : "Publisher of the Week";
  const lines = [label, "", creator.displayName];
  if (creator.bio?.trim()) {
    lines.push("", creator.bio.trim());
  }
  const handle = formatInstagramHandle(creator.instagram);
  if (handle) lines.push("", handle);
  lines.push("", "#photobook #photobookjousting", "", "Link in bio \u2192");
  return lines.join("\n");
}
function buildDefaultCreatorInstagramFirstComment(creator) {
  return buildCreatorPageUrl(creator.slug);
}
function buildNewlyVerifiedCreatorInstagramCaption(creator) {
  const lines = [
    "New on photobookers",
    "",
    `We are delighted to welcome ${creator.displayName} to photobookers.`
  ];
  if (creator.bio?.trim()) lines.push("", creator.bio.trim());
  lines.push("", "Link in Bio");
  return lines.join("\n");
}
function formatInstagramHandle(instagram) {
  if (!instagram?.trim()) return null;
  const raw = instagram.trim();
  const urlMatch = raw.match(/instagram\.com\/([^/?#]+)/i);
  const handle = (urlMatch?.[1] ?? raw).replace(/^@/, "").split(/[/?#]/)[0]?.trim();
  if (!handle) return null;
  return `@${handle}`;
}
function formatInstagramHashtags(tags) {
  if (!tags?.length) return null;
  const hashtags = tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).map((tag) => `#${tag.replace(/\s+/g, "")}`);
  if (hashtags.length === 0) return null;
  return hashtags.join(" ");
}
function captionIncludesAllHashtags(caption, tags) {
  const tagLine = formatInstagramHashtags(tags);
  if (!tagLine) return true;
  return tagLine.split(" ").every((hashtag) => caption.includes(hashtag));
}
function ensureBookTagsInCaption(caption, tags) {
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
    return before ? `${before}

${tagLine}

${after}` : `${tagLine}

${after}`;
  }
  return `${trimmed}

${tagLine}`;
}
function buildBotdStoryHandles(book) {
  const handles = [book.artist, book.publisher].map((creator) => formatInstagramHandle(creator?.instagram)).filter((handle) => Boolean(handle));
  return handles.join("\n");
}
function buildBotdArtistDmSticker(book) {
  if (!book.artist?.displayName) return null;
  return [
    `Hi! Your book "${book.title}" was Book of the Day on photobookers.com.`,
    buildBookPageUrl(book.slug)
  ].join("\n");
}
function buildBotdPublisherDmSticker(book) {
  if (!book.publisher?.displayName) return null;
  const artistName = book.artist?.displayName ?? "the artist";
  return [
    `Hi! "${book.title}" by ${artistName} was Book of the Day on photobookers.com.`,
    buildBookPageUrl(book.slug)
  ].join("\n");
}
function buildBotdPostStickerFields(book) {
  const dms = [
    buildBotdArtistDmSticker(book),
    buildBotdPublisherDmSticker(book)
  ].filter((dm) => Boolean(dm));
  const products = buildBotdStoryHandles(book);
  return {
    text: dms.join("\n\n"),
    ...products ? { products } : {}
  };
}
function buildBotdStoryStickerFields(book) {
  const artistDm = buildBotdArtistDmSticker(book);
  const publisherDm = buildBotdPublisherDmSticker(book);
  if (artistDm && publisherDm) {
    return { text: artistDm, topics: publisherDm };
  }
  if (artistDm) return { text: artistDm };
  if (publisherDm) return { text: publisherDm };
  return { text: "Book of the Day" };
}
function buildSpotlightStoryStickerText(caption, mentions) {
  const trimmed = caption.trim();
  const mentionLines = mentions.map((mention) => {
    const handle = formatInstagramHandle(mention.instagram);
    if (!handle) return null;
    const roleLabel = mention.role ? ` (${mention.role})` : "";
    return `${handle}${roleLabel} \u2014 ${mention.displayName}`;
  }).filter((line) => Boolean(line));
  if (mentionLines.length === 0) return trimmed;
  const mentionBlock = ["", "Mention:", ...mentionLines].join("\n");
  const linkMarker = "Link in bio";
  const linkIdx = trimmed.indexOf(linkMarker);
  if (linkIdx >= 0) {
    const before = trimmed.slice(0, linkIdx).trimEnd();
    const after = trimmed.slice(linkIdx).trim();
    return `${before}${mentionBlock}

${after}`;
  }
  return `${trimmed}${mentionBlock}`;
}
function buildArtistPostStickerText(creator) {
  const handle = formatInstagramHandle(creator.instagram);
  const greeting = handle ? `Hi ${handle}! You were Artist of the Week on photobookers.com.` : `Hi! You were Artist of the Week on photobookers.com.`;
  return [greeting, buildCreatorPageUrl(creator.slug)].join("\n");
}
function buildPublisherPostStickerText(creator) {
  const handle = formatInstagramHandle(creator.instagram);
  const greeting = handle ? `Hi ${handle}! You were Publisher of the Week on photobookers.com.` : `Hi! You were Publisher of the Week on photobookers.com.`;
  return [greeting, buildCreatorPageUrl(creator.slug)].join("\n");
}
function buildBotdInstagramCaption(book, storedCaption) {
  if (!storedCaption?.trim()) {
    return buildDefaultInstagramCaption(book);
  }
  return ensureBookTagsInCaption(storedCaption, book.tags);
}
function buildDefaultInstagramCaption(book) {
  const lines = ["Book of the Day", "", book.title];
  if (book.artist?.displayName) {
    const artistHandle = formatInstagramHandle(book.artist.instagram);
    lines.push(
      `by ${book.artist.displayName}${artistHandle ? ` ${artistHandle}` : ""}`
    );
  }
  if (book.publisher?.displayName) {
    const publisherHandle = formatInstagramHandle(book.publisher.instagram);
    lines.push(
      `Published by ${book.publisher.displayName}${publisherHandle ? ` ${publisherHandle}` : ""}`
    );
  }
  const tagLine = formatInstagramHashtags(book.tags);
  if (tagLine) lines.push("", tagLine);
  lines.push("", "#photobook #photobookjousting", "", "Link in bio \u2192");
  return lines.map((line) => line.trim()).join("\n");
}
function buildDefaultInstagramFirstComment(book) {
  return buildBookPageUrl(book.slug);
}
function collectBookImageOptions(book) {
  const urls = /* @__PURE__ */ new Set();
  if (book.coverUrl) urls.add(book.coverUrl);
  for (const image of book.images ?? []) {
    if (image.imageUrl) urls.add(image.imageUrl);
  }
  return [...urls];
}
function collectCreatorImageOptions(creator, bookCoverUrls = []) {
  const urls = /* @__PURE__ */ new Set();
  if (creator.coverUrl) urls.add(creator.coverUrl);
  for (const url of bookCoverUrls) {
    if (url) urls.add(url);
  }
  return [...urls];
}
export {
  buildArtistPostStickerText,
  buildBookPageUrl,
  buildBotdInstagramCaption,
  buildBotdPostStickerFields,
  buildBotdStoryHandles,
  buildBotdStoryStickerFields,
  buildCreatorPageUrl,
  buildDefaultArtistInstagramCaption,
  buildDefaultCreatorInstagramFirstComment,
  buildDefaultInstagramCaption,
  buildDefaultInstagramFirstComment,
  buildDefaultPublisherInstagramCaption,
  buildNewlyVerifiedCreatorInstagramCaption,
  buildPublisherPostStickerText,
  buildSpotlightStoryStickerText,
  collectBookImageOptions,
  collectCreatorImageOptions,
  ensureBookTagsInCaption,
  formatInstagramHandle,
  formatInstagramHashtags
};
