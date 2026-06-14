type BookShareFields = {
  title: string;
  artist?: { displayName: string } | null;
};

type CreatorShareFields = {
  displayName: string;
  type?: string | null;
};

export function bookShareTitle(book: BookShareFields): string {
  if (book.artist?.displayName) {
    return `${book.title} by ${book.artist.displayName}`;
  }
  return book.title;
}

export function bookShareText(book: BookShareFields): string {
  return `${bookShareTitle(book)} — on Photobookers`;
}

export function bookOfTheDayShareTitle(book: BookShareFields): string {
  return `Book of the Day — ${book.title}`;
}

export function bookOfTheDayShareText(book: BookShareFields): string {
  const byArtist = book.artist?.displayName
    ? ` by ${book.artist.displayName}`
    : "";
  return `${book.title}${byArtist} — featured on Photobookers`;
}

export function creatorShareText(creator: CreatorShareFields): string {
  const label = creator.type === "publisher" ? "publisher" : "artist";
  return `${creator.displayName} — ${label} on Photobookers`;
}

export function creatorOfTheWeekShareTitle(
  creator: CreatorShareFields,
  role: string,
): string {
  return `${role} of the Week — ${creator.displayName}`;
}

export function creatorOfTheWeekShareText(
  creator: CreatorShareFields,
  role: string,
): string {
  return `${creator.displayName} is ${role} of the Week on Photobookers`;
}

export function resolveShareUrl(
  url: string | undefined,
  origin: string,
): string {
  const trimmed = url?.trim();
  if (!trimmed) return origin;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return new URL(trimmed, origin).href;
}
