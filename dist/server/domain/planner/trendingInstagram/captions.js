import {
  buildBookPageUrl,
  buildCreatorPageUrl,
  formatInstagramHandle
} from "../../../features/dashboard/admin/planner/social-media/instagramCaption.js";
const POST_HEADINGS = {
  books: "Top books this week",
  artists: "Top artists this week",
  publishers: "Top publishers this week"
};
function formatBookLine(rank, book) {
  const credits = [book.artistName, book.publisherName].filter(Boolean).join(" \xB7 ");
  return credits ? `${rank}. ${book.title} \u2014 ${credits}` : `${rank}. ${book.title}`;
}
function formatCreatorLine(rank, creator) {
  return `${rank}. ${creator.displayName}`;
}
function collectCreatorHandles(creators) {
  return creators.map((creator) => formatInstagramHandle(creator.instagram)).filter((handle) => Boolean(handle));
}
function collectBookArtistHandles(books) {
  const seen = /* @__PURE__ */ new Set();
  const handles = [];
  for (const book of books) {
    const handle = formatInstagramHandle(book.artistInstagram);
    if (!handle || seen.has(handle)) continue;
    seen.add(handle);
    handles.push(handle);
  }
  return handles;
}
function buildTrendingBooksInstagramCaption(books) {
  if (books.length === 0) return "";
  const lines = [
    POST_HEADINGS.books,
    "",
    ...books.map((book, index) => formatBookLine(index + 1, book))
  ];
  const handles = collectBookArtistHandles(books);
  if (handles.length > 0) {
    lines.push("", handles.join(" "));
  }
  lines.push("", "#photobook #photobookjousting", "", "Link in bio \u2192");
  return lines.join("\n");
}
function buildTrendingCreatorsInstagramCaption(kind, creators) {
  if (creators.length === 0) return "";
  const lines = [
    POST_HEADINGS[kind],
    "",
    ...creators.map((creator, index) => formatCreatorLine(index + 1, creator))
  ];
  const handles = collectCreatorHandles(creators);
  if (handles.length > 0) {
    lines.push("", handles.join(" "));
  }
  lines.push("", "#photobook #photobookjousting", "", "Link in bio \u2192");
  return lines.join("\n");
}
function buildTrendingInstagramFirstComment(kind, trending) {
  const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
  if (!useFirstComment) return void 0;
  if (kind === "books") {
    const slug2 = trending.books[0]?.bookSlug;
    return slug2 ? buildBookPageUrl(slug2) : void 0;
  }
  const creators = kind === "artists" ? trending.artists : trending.publishers;
  const slug = creators[0]?.slug;
  return slug ? buildCreatorPageUrl(slug) : void 0;
}
function buildTrendingInstagramCaptions(trending) {
  return {
    books: buildTrendingBooksInstagramCaption(trending.books),
    artists: buildTrendingCreatorsInstagramCaption("artists", trending.artists),
    publishers: buildTrendingCreatorsInstagramCaption(
      "publishers",
      trending.publishers
    )
  };
}
function trendingPostHasContent(kind, trending) {
  if (kind === "books") return trending.books.length > 0;
  if (kind === "artists") return trending.artists.length > 0;
  return trending.publishers.length > 0;
}
function trendingItemsForKind(kind, trending) {
  if (kind === "books") {
    return trending.books.map((book) => ({
      title: book.title,
      subtitle: [book.artistName, book.publisherName].filter(Boolean).join(" \xB7 "),
      coverUrl: book.coverUrl
    }));
  }
  const creators = kind === "artists" ? trending.artists : trending.publishers;
  return creators.map((creator) => ({
    title: creator.displayName,
    coverUrl: creator.coverUrl
  }));
}
export {
  buildTrendingBooksInstagramCaption,
  buildTrendingCreatorsInstagramCaption,
  buildTrendingInstagramCaptions,
  buildTrendingInstagramFirstComment,
  trendingItemsForKind,
  trendingPostHasContent
};
