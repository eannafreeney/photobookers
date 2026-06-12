import { FC } from "hono/jsx";
import type { AuthUser } from "../../../../types";
import type { BookCardResult } from "../../../constants/queries";
import { getFilteredBooks } from "../../app/services";
import { favoriteFlagsForBooks } from "../findFlags";
import { hyperviewBooksFilterUrl } from "../../../lib/tags";
import { Style, Text, View } from "../../../lib/hxml-comps";
import BookCard, { bookCardStyles } from "./BookCard";
import BookFiltersPanel, {
  BOOKS_CATALOG_TARGET_ID,
  bookFiltersStyles,
} from "./BookFiltersPanel";
import SecondaryButtonLink, {
  secondaryButtonLinkStyles,
} from "./SecondaryButtonLink";
import SectionHeader from "./SectionHeader";

export const FEATURED_LATEST_BOOKS_TAB = "/hyperview/featured/tab/latest-books";
export const FEATURED_LATEST_BOOKS_LIMIT = 10;

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

export const loadFeaturedLatestBooksCatalog = async (
  user: AuthUser | null | undefined,
  baseUrl: string,
  tag: string | null = null,
  q: string | null = null,
): Promise<FeaturedLatestBooksCatalogProps | null> => {
  const isFiltered = Boolean(tag?.trim() || (q?.trim()?.length ?? 0) >= 3);
  const [error, result] = await getFilteredBooks({
    tag,
    q,
    page: 1,
    limit: FEATURED_LATEST_BOOKS_LIMIT,
  });

  if (error || !result) return null;

  const favoritesByBookId = await favoriteFlagsForBooks(user ?? null, result.books);

  return {
    books: result.books,
    baseUrl,
    favoritesByBookId,
    isFiltered,
    hasMore: result.totalPages > 1,
    viewAllHref: hyperviewBooksFilterUrl(baseUrl, { tag, q }),
  };
};

type CatalogProps = FeaturedLatestBooksCatalogProps;

export const BookGridCatalog: FC<CatalogProps> = ({
  books,
  baseUrl,
  favoritesByBookId,
  isFiltered,
  hasMore,
  viewAllHref,
}) => (
  <>
    {isFiltered && books.length === 0 ? (
      <Text style="featured-empty-hint">No books match your filters.</Text>
    ) : (
      books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          isFavorited={favoritesByBookId[book.id] ?? false}
        />
      ))
    )}
    {hasMore ? (
      <SecondaryButtonLink label="View All Books →" href={viewAllHref} />
    ) : null}
  </>
);

type Props = CatalogProps & {
  tag: string | null;
  q: string | null;
};

const BookGridWithFilters: FC<Props> = ({ baseUrl, tag, q, ...catalogProps }) => (
  <View style="latest-books-section">
    <SectionHeader
      title="Latest Books"
      viewAllHref={catalogProps.viewAllHref}
    />
    <BookFiltersPanel
      baseUrl={baseUrl}
      activeTag={tag}
      q={q}
      filterPath={featuredLatestBooksFilterPath(baseUrl)}
    />
    <View id={BOOKS_CATALOG_TARGET_ID} style="latest-books-catalog">
      <BookGridCatalog baseUrl={baseUrl} {...catalogProps} />
    </View>
  </View>
);

export default BookGridWithFilters;

export const bookGridWithFiltersStyles = () => (
  <>
    <Style
      id="latest-books-section"
      flexDirection="column"
      gap={0}
      marginBottom={24}
    />
    <Style id="latest-books-catalog" flexDirection="column" gap={0} />
    <Style
      id="latest-books-fragment"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      paddingTop={24}
      paddingBottom={24}
      minHeight={120}
    />
    {bookFiltersStyles()}
    {bookCardStyles()}
    {secondaryButtonLinkStyles()}
  </>
);
