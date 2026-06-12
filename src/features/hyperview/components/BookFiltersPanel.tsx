import { FC } from "hono/jsx";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";
import { DISCOVER_TAGS } from "../../../constants/discover";
import {
  hyperviewBooksFilterUrl,
  slugToTag,
  tagToSlug,
} from "../../../lib/tags";
import { capitalize } from "../../../utils";

export const BOOKS_CATALOG_TARGET_ID = "books-catalog";
export const BOOKS_LIST_TARGET_ID = "books-list-host";
/** Element id for `toggle` — must not match any `<style id="…">`. */
export const BOOKS_FILTERS_DRAWER_ID = "book-filters-drawer";
export const BOOKS_FILTER_Q_ID = "books-filter-q";

const MIN_SEARCH_LENGTH = 3;

type Props = {
  baseUrl: string;
  activeTag?: string | null;
  q?: string | null;
};

const filterSummary = (activeSlug: string | null, trimmedQ: string) => {
  const parts: string[] = [];
  if (activeSlug) parts.push(capitalize(slugToTag(activeSlug)));
  if (trimmedQ.length >= MIN_SEARCH_LENGTH) parts.push(`"${trimmedQ}"`);
  return parts.length > 0 ? ` · ${parts.join(" · ")}` : "";
};

const catalogHref = (
  baseUrl: string,
  { tag, q }: { tag?: string | null; q?: string | null },
) => {
  const path = hyperviewBooksFilterUrl(baseUrl, { tag, q });
  return `${path}${path.includes("?") ? "&" : "?"}fragment=catalog`;
};

const BookFiltersPanel = ({ baseUrl, activeTag = null, q = null }: Props) => {
  const trimmedQ = q?.trim() ?? "";
  const activeSlug = activeTag?.trim() || null;
  const summary = filterSummary(activeSlug, trimmedQ);
  const hasActiveFilters =
    Boolean(activeSlug) || trimmedQ.length >= MIN_SEARCH_LENGTH;
  const booksPostHref = `${baseUrl}/hyperview/books`;
  const searchPostHref = activeSlug
    ? `${booksPostHref}?tag=${encodeURIComponent(activeSlug)}`
    : booksPostHref;

  return (
    <View style="book-filters">
      <View style="book-filters-toggle">
        <View style="book-filters-toggle-main">
          <Text style="book-filters-toggle-label" number-of-lines={1}>
            Filters{summary}
          </Text>
          <Text style="book-filters-toggle-chevron">▾</Text>
          <Behavior action="toggle" target={BOOKS_FILTERS_DRAWER_ID} />
        </View>
        {hasActiveFilters ? (
          <View style="book-filters-toggle-clear">
            <Text style="book-filters-clear-label">Clear</Text>
            <Behavior
              verb="get"
              action="replace"
              target={BOOKS_CATALOG_TARGET_ID}
              href={catalogHref(baseUrl, {})}
            />
          </View>
        ) : null}
      </View>
      <View id={BOOKS_FILTERS_DRAWER_ID} hide="true">
        <View style="book-filters-panel">
          <View style="book-filters-tags">
            <View
              style={
                activeSlug ? "book-filter-pill" : "book-filter-pill-active"
              }
            >
              <Behavior
                verb="get"
                action="replace"
                target={BOOKS_CATALOG_TARGET_ID}
                href={catalogHref(baseUrl, {})}
              />
              <Text
                style={
                  activeSlug
                    ? "book-filter-pill-label"
                    : "book-filter-pill-label-active"
                }
              >
                All
              </Text>
            </View>
            {DISCOVER_TAGS.map((tag) => {
              const slug = tagToSlug(tag);
              const isActive = activeSlug === slug;
              return (
                <View
                  key={tag}
                  style={
                    isActive ? "book-filter-pill-active" : "book-filter-pill"
                  }
                >
                  <Behavior
                    verb="get"
                    action="replace"
                    target={BOOKS_CATALOG_TARGET_ID}
                    href={catalogHref(baseUrl, { tag: slug })}
                  />
                  <Text
                    style={
                      isActive
                        ? "book-filter-pill-label-active"
                        : "book-filter-pill-label"
                    }
                  >
                    {capitalize(tag)}
                  </Text>
                </View>
              );
            })}
          </View>
          <Form id="books-filter-form">
            <View style="book-filters-search-row">
              <TextField
                id={BOOKS_FILTER_Q_ID}
                style="book-filters-search-input"
                name="q"
                value={trimmedQ}
                placeholder="Search by title, artist, publisher, or tag…"
              >
                <Behavior
                  trigger="change"
                  delay={400}
                  verb="post"
                  action="replace"
                  target={BOOKS_CATALOG_TARGET_ID}
                  href={searchPostHref}
                />
              </TextField>
              <View style="book-filters-clear">
                <Text style="book-filters-clear-label">Clear</Text>
                <Behavior
                  verb="get"
                  action="replace"
                  target={BOOKS_CATALOG_TARGET_ID}
                  href={catalogHref(baseUrl, {})}
                />
              </View>
            </View>
          </Form>
        </View>
      </View>
    </View>
  );
};

export default BookFiltersPanel;

export const bookFiltersStyles = () => (
  <>
    <Style id="books-catalog-shell" flex={1} flexDirection="column" />
    <Style
      id="book-filters"
      flexShrink={0}
      width="100%"
      marginBottom={16}
      backgroundColor="#FFFFFF"
      borderBottomWidth={1}
      borderBottomColor="#E5E5E4"
    />
    <Style
      id="book-filters-toggle"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
    />
    <Style
      id="book-filters-toggle-main"
      flex={1}
      flexDirection="row"
      alignItems="center"
    />
    <Style
      id="book-filters-toggle-clear"
      paddingTop={6}
      paddingBottom={6}
      paddingLeft={12}
      paddingRight={12}
      marginLeft={8}
      flexShrink={0}
    />
    <Style
      id="book-filters-toggle-label"
      fontSize={14}
      fontWeight="600"
      color="#1C1C1E"
      marginRight={6}
    />
    <Style id="book-filters-toggle-chevron" fontSize={14} color="#9CA3AF" />
    <Style
      id="book-filters-panel"
      paddingTop={0}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderTopWidth={1}
      borderTopColor="#E5E5E4"
    />
    <Style
      id="book-filters-tags"
      flexDirection="row"
      flexWrap="wrap"
      alignItems="flex-start"
      marginBottom={12}
      marginTop={12}
    />
    <Style
      id="book-filter-pill"
      borderWidth={1}
      borderColor="#E5E5E4"
      borderRadius={999}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
      backgroundColor="#FFFFFF"
      marginRight={8}
      marginBottom={8}
    />
    <Style
      id="book-filter-pill-active"
      borderWidth={1}
      borderColor="#1C1C1E"
      borderRadius={999}
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={14}
      paddingRight={14}
      backgroundColor="#1C1C1E"
      marginRight={8}
      marginBottom={8}
    />
    <Style
      id="book-filter-pill-label"
      fontSize={14}
      fontWeight="500"
      color="#1C1C1E"
    />
    <Style
      id="book-filter-pill-label-active"
      fontSize={14}
      fontWeight="600"
      color="#FFFFFF"
    />
    <Style
      id="book-filters-search-row"
      flexDirection="row"
      alignItems="center"
      gap={8}
    />
    <Style
      id="book-filters-search-input"
      flex={1}
      borderWidth={1}
      borderColor="#E5E5E4"
      borderRadius={999}
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={16}
      paddingRight={16}
      fontSize={15}
      backgroundColor="#F4F4F3"
      color="#1C1C1E"
    />
    <Style
      id="book-filters-clear"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={12}
      paddingRight={12}
      flexShrink={0}
    />
    <Style
      id="book-filters-clear-label"
      fontSize={14}
      fontWeight="500"
      color="#6B6B6B"
    />
    <Style id="books-list-panel" flex={1} />
  </>
);
