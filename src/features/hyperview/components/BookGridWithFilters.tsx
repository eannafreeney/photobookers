import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import type { BookCardResult } from "../../../constants/queries";
import { type BookCatalogSort } from "../../../lib/bookCatalogSort";
import { getFilteredBooks } from "../../app/services";
import { favoriteFlagsForBooks } from "../findFlags";
import {
  hyperviewBooksFilterUrl,
  resolveBookCatalogSort,
} from "../../../lib/tags";
import { ScrollView, Style, Text, View } from "../../../lib/hxml-comps";
import BookCard, { bookCardStyles } from "./BookCard";
import BookFiltersPanel, {
  BOOKS_CATALOG_TARGET_ID,
  bookFiltersStyles,
} from "./BookFiltersPanel";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "./SecondaryButtonLink";
import SectionHeader from "./SectionHeader";

const FEATURED_LATEST_BOOKS_TAB = "/hyperview/featured/tab/latest-books";
const FEATURED_LATEST_BOOKS_LIMIT = 5;
export const FEATURED_LATEST_BOOKS_DEFAULT_SORT = "trending" as const;
const FEATURED_LATEST_BOOKS_SCROLL_ID = "featured-latest-books-scroll";

export const featuredLatestBooksFilterPath = (baseUrl: string) =>
  `${baseUrl}${FEATURED_LATEST_BOOKS_TAB}`;

export type FeaturedLatestBooksCatalogProps = {
  books: BookCardResult[];
  baseUrl: string;
  favoritesByBookId: Record<string, boolean>;
  isFiltered: boolean;
  hasMore: boolean;
  viewAllHref: string;
};

type CatalogShellProps = FeaturedLatestBooksCatalogProps & {
  tag: string | null;
  q: string | null;
  sort: BookCatalogSort;
  defaultSort: BookCatalogSort;
};

export const FeaturedLatestBooksCatalogShell = ({
  baseUrl,
  tag,
  q,
  sort,
  defaultSort,
  ...catalogProps
}: CatalogShellProps) => (
  <View
    id={BOOKS_CATALOG_TARGET_ID}
    style="books-catalog-shell"
    xmlns="https://hyperview.org/hyperview"
  >
    <BookFiltersPanel
      baseUrl={baseUrl}
      activeTag={tag}
      q={q}
      sort={sort}
      defaultSort={defaultSort}
      filterPath={featuredLatestBooksFilterPath(baseUrl)}
      scrollToTopTarget={FEATURED_LATEST_BOOKS_SCROLL_ID}
    />
    <ScrollView
      id={FEATURED_LATEST_BOOKS_SCROLL_ID}
      style="books-scroll"
      horizontal="true"
      shows-scroll-indicator="false"
    >
      <BookGridCatalog baseUrl={baseUrl} {...catalogProps} />
    </ScrollView>
    {catalogProps.hasMore && catalogProps.books.length > 0 ? (
      <View style="featured-books-see-all-wrap">
        <SecondaryButtonLink label="See all" href={catalogProps.viewAllHref} />
      </View>
    ) : null}
  </View>
);

export const loadFeaturedLatestBooksCatalog = async (
  user: AuthUser | null | undefined,
  baseUrl: string,
  tag: string | null = null,
  q: string | null = null,
  sortParam: string | null = null,
): Promise<FeaturedLatestBooksCatalogProps | null> => {
  const defaultSort = FEATURED_LATEST_BOOKS_DEFAULT_SORT;
  const sort = resolveBookCatalogSort(sortParam, defaultSort);
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    query: q,
    page: 1,
    limit: FEATURED_LATEST_BOOKS_LIMIT,
    sort,
  });

  if (error || !result) return null;

  const favoritesByBookId = await favoriteFlagsForBooks(
    user ?? null,
    result.books,
  );

  return {
    books: result.books,
    baseUrl,
    favoritesByBookId,
    isFiltered,
    hasMore: result.totalPages > 1,
    viewAllHref: hyperviewBooksFilterUrl(baseUrl, {
      tag,
      query: q,
      sort,
      defaultSort,
    }),
  };
};

type CatalogProps = FeaturedLatestBooksCatalogProps;

export const BookGridCatalog = ({
  books,
  baseUrl,
  favoritesByBookId,
  isFiltered,
}: CatalogProps) => (
  <>
    {isFiltered && books.length === 0 ? (
      <Text style="featured-empty-hint">No books match your filters.</Text>
    ) : (
      books.map((book) => (
        <View key={book.id} style="featured-book-card-wrap">
          <BookCard
            book={book}
            baseUrl={baseUrl}
            isFavorited={favoritesByBookId[book.id] ?? false}
          />
        </View>
      ))
    )}
  </>
);

type Props = CatalogProps & {
  tag: string | null;
  q: string | null;
  sort: BookCatalogSort;
  defaultSort: BookCatalogSort;
};

const BookGridWithFilters: FC<Props> = ({
  baseUrl,
  tag,
  q,
  sort,
  defaultSort,
  ...catalogProps
}) => (
  <View style="latest-books-section">
    <SectionHeader
      title="Latest Books"
      viewAllHref={catalogProps.viewAllHref}
    />
    <FeaturedLatestBooksCatalogShell
      baseUrl={baseUrl}
      tag={tag}
      q={q}
      sort={sort}
      defaultSort={defaultSort}
      {...catalogProps}
    />
  </View>
);

type FeaturedLatestBooksSectionProps = {
  baseUrl: string;
  user?: AuthUser | null;
};

export const FeaturedLatestBooksSection = async ({
  baseUrl,
  user = null,
}: FeaturedLatestBooksSectionProps) => {
  const catalogProps = await loadFeaturedLatestBooksCatalog(user, baseUrl);

  if (!catalogProps) return <></>;

  return (
    <BookGridWithFilters
      {...catalogProps}
      tag={null}
      q={null}
      sort={FEATURED_LATEST_BOOKS_DEFAULT_SORT}
      defaultSort={FEATURED_LATEST_BOOKS_DEFAULT_SORT}
    />
  );
};

export default BookGridWithFilters;

export const bookGridWithFiltersStyles = () => (
  <>
    <Style
      id="latest-books-section"
      flexDirection="column"
      gap={0}
      marginBottom={24}
    />
    <Style id="books-scroll" flexDirection="row" />
    <Style
      id="featured-book-card-wrap"
      width={320}
      marginRight={12}
      flexShrink={0}
    />
    <Style id="featured-books-see-all-wrap" width="100%" paddingTop={12} />
    {bookFiltersStyles()}
    {bookCardStyles()}
    {secondaryButtonLinkStyles()}
  </>
);
