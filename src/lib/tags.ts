export const tagToSlug = (tag: string) =>
  tag.toLowerCase().replace(/\s+/g, "-");

export const slugToTag = (slug: string) => slug.replace(/-/g, " ");

type BooksFilterParams = {
  tag?: string | null;
  q?: string | null;
};

export const booksFilterUrl = (
  base: string,
  { tag, q }: BooksFilterParams,
): string => {
  const params = new URLSearchParams();
  const trimmedTag = tag?.trim();
  const trimmedQ = q?.trim();
  if (trimmedTag) params.set("tag", trimmedTag);
  if (trimmedQ) params.set("q", trimmedQ);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export const hyperviewBooksFilterUrl = (
  baseUrl: string,
  { tag, q }: BooksFilterParams,
): string => booksFilterUrl(`${baseUrl}/hyperview/books`, { tag, q });

export const tagBooksUrl = (tag: string) => `/books/tags/${tagToSlug(tag)}`;

export const hyperviewTagBooksUrl = (baseUrl: string, tag: string) =>
  `${baseUrl}/hyperview/tags/${tagToSlug(tag)}`;
