import { createRoute } from "hono-fsr";
import SectionHeader from "../../../components/app/SectionHeader";
import Button from "../../../components/app/Button";
import BooksSlider from "../../../features/app/components/BooksSlider";
import ViewAllLink from "../../../features/app/components/ViewAllLink";
import { getFilteredBooks } from "../../../features/app/services";
import {
  BOOK_CATALOG_DEFAULT_SORT,
  type BookCatalogSort,
} from "../../../lib/bookCatalogSort";
import { booksFilterUrl, resolveBookCatalogSort } from "../../../lib/tags";
import { getUser } from "../../../utils";

const FEATURED_BOOKS_LIMIT = 12;

const SECTION_COPY: Record<BookCatalogSort, { kicker: string; title: string }> =
  {
    trending: { kicker: "What's Hot", title: "Trending Books" },
    newest: { kicker: "By Release", title: "New Books" },
    latest: { kicker: "Just Added", title: "Latest Books" },
  };

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const sort = resolveBookCatalogSort(
    c.req.query("sort"),
    BOOK_CATALOG_DEFAULT_SORT,
  );
  const viewAllHref = booksFilterUrl("/books", {
    sort,
    defaultSort: BOOK_CATALOG_DEFAULT_SORT,
  });
  const { kicker, title } = SECTION_COPY[sort];
  const fragmentId = `books-slider-${sort}`;

  const [error, result] = await getFilteredBooks({
    page: 1,
    limit: FEATURED_BOOKS_LIMIT,
    sort,
  });

  if (error || !result?.books.length) return c.html(<></>);

  return c.html(
    <div id={fragmentId}>
      <SectionHeader
        kicker={kicker}
        action={<ViewAllLink href={viewAllHref} />}
      >
        {title}
      </SectionHeader>
      <BooksSlider books={result.books} user={user} />
      {/* <div class="mt-8 flex justify-center md:hidden">
        <a href={viewAllHref}>
          <Button variant="solid" color="primary" width="xl">
            View All Books →
          </Button>
        </a>
      </div> */}
    </div>,
  );
});
