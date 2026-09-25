import { err, ok } from "../../../lib/result";

const MAX_PRINTERS = 3;

export function planQuotePrinters(printerIds: string[]) {
  const unique = [...new Set(printerIds.filter(Boolean))];
  if (unique.length < 1 || unique.length > MAX_PRINTERS) {
    return err({ reason: "Choose 1 to 3 printers" });
  }
  return ok(unique);
}

export function unpublishedPrinterIds(
  requestedIds: string[],
  publishedIds: string[],
) {
  const published = new Set(publishedIds);
  return requestedIds.filter((id) => !published.has(id));
}

export function isPublicPrintedBook(
  book: {
    publicationStatus: string | null;
    approvalStatus: string | null;
    releaseDate: Date | string | null;
  },
  now = new Date(),
) {
  if (book.publicationStatus !== "published") return false;
  if (book.approvalStatus !== "approved") return false;
  if (book.releaseDate == null) return true;
  return new Date(book.releaseDate).getTime() <= now.getTime();
}

export type PrintedBookLink = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  artistName: string | null;
};

export function printedBookLinks(
  rows: {
    book: {
      id: string;
      title: string;
      slug: string;
      coverUrl: string | null;
      publicationStatus: string | null;
      approvalStatus: string | null;
      releaseDate: Date | string | null;
      artist: { displayName: string } | null;
    } | null;
  }[],
  options?: { publicOnly?: boolean; now?: Date },
): PrintedBookLink[] {
  const now = options?.now ?? new Date();
  return rows.flatMap((row) => {
    const book = row.book;
    if (!book) return [];
    if (options?.publicOnly && !isPublicPrintedBook(book, now)) return [];
    return [
      {
        id: book.id,
        title: book.title,
        slug: book.slug,
        coverUrl: book.coverUrl,
        artistName: book.artist?.displayName ?? null,
      },
    ];
  });
}
