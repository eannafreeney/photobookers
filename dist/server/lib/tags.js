const tagToSlug = (tag) => tag.toLowerCase().replace(/\s+/g, "-");
const slugToTag = (slug) => slug.replace(/-/g, " ");
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
  resolveBookCatalogSort,
  slugToTag,
  tagBooksUrl,
  tagToSlug
};
