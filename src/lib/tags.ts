export const tagToSlug = (tag: string) =>
  tag.toLowerCase().replace(/\s+/g, "-");

export const slugToTag = (slug: string) => slug.replace(/-/g, " ");

import {
  type BookCatalogSort,
  parseBookCatalogSort,
} from "./bookCatalogSort";

type BooksFilterParams = {
  tag?: string | null;
  q?: string | null;
  sort?: BookCatalogSort | null;
  defaultSort?: BookCatalogSort;
};

export const booksFilterUrl = (
  base: string,
  { tag, q, sort, defaultSort = "newest" }: BooksFilterParams,
): string => {
  const params = new URLSearchParams();
  const trimmedTag = tag?.trim();
  const trimmedQ = q?.trim();
  if (trimmedTag) params.set("tag", trimmedTag);
  if (trimmedQ) params.set("q", trimmedQ);
  if (sort && sort !== defaultSort) params.set("sort", sort);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

export const resolveBookCatalogSort = (
  sortParam: string | null | undefined,
  defaultSort: BookCatalogSort = "newest",
): BookCatalogSort => parseBookCatalogSort(sortParam) ?? defaultSort;

export const hyperviewBooksFilterUrl = (
  baseUrl: string,
  { tag, q }: BooksFilterParams,
): string => booksFilterUrl(`${baseUrl}/hyperview/books`, { tag, q });

export const tagBooksUrl = (tag: string) => `/books/tags/${tagToSlug(tag)}`;

export const hyperviewTagBooksUrl = (baseUrl: string, tag: string) =>
  `${baseUrl}/hyperview/tags/${tagToSlug(tag)}`;
