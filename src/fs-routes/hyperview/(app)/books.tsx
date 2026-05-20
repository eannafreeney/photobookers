import { createRoute } from "hono-fsr";
import { getLatestBooks } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { bookCardStyles } from "../../../features/hyperview/components/BookCard";
import { Items, List, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { wishlistFlagsForBooks } from "../../../features/hyperview/findFlags";
import BooksListItems, {
  bookListItemsStyles,
} from "../../../features/hyperview/components/BookListItems";

const PAGE_SIZE = 10;

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");

  const [error, result] = await getLatestBooks(currentPage, PAGE_SIZE);
  // if (error) return hxml(c, errorScreen("Failed to load books."));

  const books = result?.books ?? [];
  const totalPages = result?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;
  const wishlistsByBookId = await wishlistFlagsForBooks(user, books);

  if (currentPage > 1) {
    return hv(
      <Items>
        <BooksListItems
          books={books}
          baseUrl={baseUrl}
          wishlistsByBookId={wishlistsByBookId}
          page={currentPage}
          hasMore={hasMore}
        />
      </Items>,
    );
  }

  return hv(
    <AppLayout
      title="All Books"
      user={user}
      showDock
      dockActive="books"
      baseUrl={baseUrl}
      extraStyles={pageStyles()}
      nativeList
    >
      <List id="books-list" style="books-list">
        <BooksListItems
          books={books}
          baseUrl={baseUrl}
          wishlistsByBookId={wishlistsByBookId}
          page={currentPage}
          hasMore={hasMore}
        />
      </List>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {/* <Style id="page-content" margin={16} /> */}
    {bookCardStyles()}
    {bookListItemsStyles()}
  </>
);
