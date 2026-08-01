import { sql } from "drizzle-orm";
const stripDiacritics = (value) => value.normalize("NFD").replace(new RegExp("\\p{Mark}", "gu"), "");
const normalizeTagForMatch = (tag) => stripDiacritics(tag.toLowerCase().trim());
const normalizeTagSlug = (slug) => normalizeTagForMatch(slug).replace(/-+/g, "-").replace(/^-|-$/g, "");
const tagToSlug = (tag) => normalizeTagForMatch(tag).replace(/\s+/g, "-");
const slugToTag = (slug) => slug.replace(/-/g, " ");
const tagMatchesBookTags = (tagsColumn, tag) => {
  const normalized = normalizeTagForMatch(tag);
  return sql`EXISTS (
    SELECT 1 FROM unnest(${tagsColumn}) AS t
    WHERE regexp_replace(normalize(lower(t), NFKD), '[\u0300-\u036f]+', '', 'g') = ${normalized}
  )`;
};
import { parseBookCatalogSort } from "./bookCatalogSort.js";
const booksFilterUrl = (base, { tag, query, sort, defaultSort = "newest" }) => {
  const params = new URLSearchParams();
  const trimmedTag = tag?.trim();
  const trimmedQ = query?.trim();
  if (trimmedTag) params.set("tag", trimmedTag);
  if (trimmedQ) params.set("q", trimmedQ);
  if (sort && sort !== defaultSort) params.set("sort", sort);
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
};
const resolveBookCatalogSort = (sortParam, defaultSort = "newest") => parseBookCatalogSort(sortParam) ?? defaultSort;
const hyperviewBooksFilterUrl = (baseUrl, params) => booksFilterUrl(`${baseUrl}/hyperview/books`, params);
const tagBooksUrl = (tag) => `/books/tags/${tagToSlug(tag)}`;
const hyperviewTagBooksUrl = (baseUrl, tag) => `${baseUrl}/hyperview/tags/${tagToSlug(tag)}`;
export {
  booksFilterUrl,
  hyperviewBooksFilterUrl,
  hyperviewTagBooksUrl,
  normalizeTagForMatch,
  normalizeTagSlug,
  resolveBookCatalogSort,
  slugToTag,
  stripDiacritics,
  tagBooksUrl,
  tagMatchesBookTags,
  tagToSlug
};
