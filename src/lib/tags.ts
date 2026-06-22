export const tagToSlug = (tag: string) =>
  tag.toLowerCase().replace(/\s+/g, "-");

export const slugToTag = (slug: string) => slug.replace(/-/g, " ");

import { type BookCatalogSort, parseBookCatalogSort } from "./bookCatalogSort";

type BooksFilterParams = {
  tag?: string | null;
  query?: string | null;
  sort?: BookCatalogSort | null;
  defaultSort?: BookCatalogSort;
};

export const booksFilterUrl = (
  base: string,
  { tag, query, sort, defaultSort = "newest" }: BooksFilterParams,
): string => {
  const params = new URLSearchParams();
  const trimmedTag = tag?.trim();
  const trimmedQ = query?.trim();
  if (trimmedTag) params.set("tag", trimmedTag);
  if (trimmedQ) params.set("q", trimmedQ);
  if (sort && sort !== defaultSort) params.set("sort", sort);
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
};

export const resolveBookCatalogSort = (
  sortParam: string | null | undefined,
  defaultSort: BookCatalogSort = "newest",
): BookCatalogSort => parseBookCatalogSort(sortParam) ?? defaultSort;

export const hyperviewBooksFilterUrl = (
  baseUrl: string,
  params: BooksFilterParams,
): string => booksFilterUrl(`${baseUrl}/hyperview/books`, params);

export const tagBooksUrl = (tag: string) => `/books/tags/${tagToSlug(tag)}`;

export const hyperviewTagBooksUrl = (baseUrl: string, tag: string) =>
  `${baseUrl}/hyperview/tags/${tagToSlug(tag)}`;
