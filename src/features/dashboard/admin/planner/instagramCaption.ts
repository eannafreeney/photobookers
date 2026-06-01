const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

type BookForCaption = {
  title: string;
  slug: string;
  artist?: { displayName: string } | null;
  publisher?: { displayName: string } | null;
};

export function buildDefaultInstagramCaption(book: BookForCaption): string {
  const lines = [`Book of the Day: ${book.title}`];
  if (book.artist?.displayName) {
    lines.push(book.artist.displayName);
  }
  if (book.publisher?.displayName) {
    lines.push(`Published by: ${book.publisher.displayName}`);
  }
  lines.push(`${appBaseUrl}/book-of-the-day`);
  return lines.join("\n");
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
