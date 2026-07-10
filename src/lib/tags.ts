import { sql, type SQLWrapper } from "drizzle-orm";

export const stripDiacritics = (value: string) =>
  value.normalize("NFD").replace(/\p{Mark}/gu, "");

export const normalizeTagForMatch = (tag: string) =>
  stripDiacritics(tag.toLowerCase().trim());

export const normalizeTagSlug = (slug: string) =>
  normalizeTagForMatch(slug)
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const tagToSlug = (tag: string) =>
  normalizeTagForMatch(tag).replace(/\s+/g, "-");

export const slugToTag = (slug: string) => slug.replace(/-/g, " ");

/** Accent-insensitive tag equality against a book's tags array column. */
export const tagMatchesBookTags = (tagsColumn: SQLWrapper, tag: string) => {
  const normalized = normalizeTagForMatch(tag);
  return sql`EXISTS (
    SELECT 1 FROM unnest(${tagsColumn}) AS t
    WHERE regexp_replace(normalize(lower(t), NFKD), '[\u0300-\u036f]+', '', 'g') = ${normalized}
  )`;
};

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
