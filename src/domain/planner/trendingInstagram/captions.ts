import {
  buildBookPageUrl,
  buildCreatorPageUrl,
  formatInstagramHandle,
} from "../../../features/dashboard/admin/planner/social-media/instagramCaption";
import type {
  WeeklyNewsletterTrending,
  WeeklyNewsletterTrendingBookItem,
  WeeklyNewsletterTrendingCreatorItem,
} from "../../../features/dashboard/admin/newsletters/types";
import type { TrendingInstagramPostKind } from "../../../features/dashboard/admin/newsletters/types";

const POST_HEADINGS: Record<TrendingInstagramPostKind, string> = {
  books: "Top books this week",
  artists: "Top artists this week",
  publishers: "Top publishers this week",
};

function formatBookLine(
  rank: number,
  book: WeeklyNewsletterTrendingBookItem,
): string {
  const credits = [book.artistName, book.publisherName]
    .filter(Boolean)
    .join(" · ");
  return credits
    ? `${rank}. ${book.title} — ${credits}`
    : `${rank}. ${book.title}`;
}

function formatCreatorLine(
  rank: number,
  creator: WeeklyNewsletterTrendingCreatorItem,
): string {
  return `${rank}. ${creator.displayName}`;
}

function collectCreatorHandles(
  creators: WeeklyNewsletterTrendingCreatorItem[],
): string[] {
  return creators
    .map((creator) => formatInstagramHandle(creator.instagram))
    .filter((handle): handle is string => Boolean(handle));
}

export function buildTrendingBooksInstagramCaption(
  books: WeeklyNewsletterTrendingBookItem[],
): string {
  if (books.length === 0) return "";

  const lines = [
    POST_HEADINGS.books,
    "",
    ...books.map((book, index) => formatBookLine(index + 1, book)),
    "",
    "#photobook #photobookjousting",
    "",
    "Link in bio →",
  ];
  return lines.join("\n");
}

export function buildTrendingCreatorsInstagramCaption(
  kind: "artists" | "publishers",
  creators: WeeklyNewsletterTrendingCreatorItem[],
): string {
  if (creators.length === 0) return "";

  const lines = [
    POST_HEADINGS[kind],
    "",
    ...creators.map((creator, index) => formatCreatorLine(index + 1, creator)),
  ];

  const handles = collectCreatorHandles(creators);
  if (handles.length > 0) {
    lines.push("", handles.join(" "));
  }

  lines.push("", "#photobook #photobookjousting", "", "Link in bio →");
  return lines.join("\n");
}

export function buildTrendingInstagramFirstComment(
  kind: TrendingInstagramPostKind,
  trending: WeeklyNewsletterTrending,
): string | undefined {
  const useFirstComment = process.env.BUFFER_INSTAGRAM_FIRST_COMMENT === "true";
  if (!useFirstComment) return undefined;

  if (kind === "books") {
    const slug = trending.books[0]?.bookSlug;
    return slug ? buildBookPageUrl(slug) : undefined;
  }

  const creators =
    kind === "artists" ? trending.artists : trending.publishers;
  const slug = creators[0]?.slug;
  return slug ? buildCreatorPageUrl(slug) : undefined;
}

export function buildTrendingInstagramCaptions(trending: WeeklyNewsletterTrending) {
  return {
    books: buildTrendingBooksInstagramCaption(trending.books),
    artists: buildTrendingCreatorsInstagramCaption("artists", trending.artists),
    publishers: buildTrendingCreatorsInstagramCaption(
      "publishers",
      trending.publishers,
    ),
  };
}

export function trendingPostHasContent(
  kind: TrendingInstagramPostKind,
  trending: WeeklyNewsletterTrending,
): boolean {
  if (kind === "books") return trending.books.length > 0;
  if (kind === "artists") return trending.artists.length > 0;
  return trending.publishers.length > 0;
}

export function trendingItemsForKind(
  kind: TrendingInstagramPostKind,
  trending: WeeklyNewsletterTrending,
): Array<{ title: string; subtitle?: string | null; coverUrl?: string | null }> {
  if (kind === "books") {
    return trending.books.map((book) => ({
      title: book.title,
      subtitle: [book.artistName, book.publisherName]
        .filter(Boolean)
        .join(" · "),
      coverUrl: book.coverUrl,
    }));
  }

  const creators =
    kind === "artists" ? trending.artists : trending.publishers;
  return creators.map((creator) => ({
    title: creator.displayName,
    coverUrl: creator.coverUrl,
  }));
}
