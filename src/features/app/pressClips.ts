import type { BookPressLink } from "../../db/schema";
import { formatOrdinalDate, parseDateString } from "../../lib/utils";

export type PressClipCreator = {
  displayName: string;
  slug: string;
};

export type PressClipBook = {
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseDate?: Date | null;
  artist: PressClipCreator | null;
  publisher: PressClipCreator | null;
  pressLinks: BookPressLink[] | null;
};

export type PressClip = {
  book: {
    slug: string;
    title: string;
    coverUrl: string | null;
    artist: PressClipCreator | null;
    publisher: PressClipCreator | null;
    releaseDate: Date | null;
  };
  link: BookPressLink;
};

export function pressLinkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function formatPressPublishedAt(
  publishedAt: string | null | undefined,
): string | null {
  if (!publishedAt) return null;
  const date = parseDateString(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return formatOrdinalDate(date);
}

function sortTime(value: Date | string | null | undefined): number {
  if (!value) return 0;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? 0 : t;
  }
  const parsed = parseDateString(value);
  const t = parsed.getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** publishedAt, else book release date. Missing dates sort last. */
export function pressClipSortTime(clip: PressClip): number {
  return sortTime(clip.link.publishedAt) || sortTime(clip.book.releaseDate);
}

export function sortPressClips(clips: PressClip[]): PressClip[] {
  return [...clips].sort((a, b) => {
    const delta = pressClipSortTime(b) - pressClipSortTime(a);
    if (delta !== 0) return delta;
    return `${a.book.slug}:${a.link.url}`.localeCompare(
      `${b.book.slug}:${b.link.url}`,
    );
  });
}

/** One row per press link, preserving book order then link order. */
export function flattenPressClips(rows: PressClipBook[]): PressClip[] {
  return rows.flatMap((book) =>
    (book.pressLinks ?? []).map((link) => ({
      book: {
        slug: book.slug,
        title: book.title,
        coverUrl: book.coverUrl,
        artist: book.artist,
        publisher: book.publisher,
        releaseDate: book.releaseDate ?? null,
      },
      link,
    })),
  );
}

export function toPressClips(rows: PressClipBook[]): PressClip[] {
  return sortPressClips(flattenPressClips(rows));
}
