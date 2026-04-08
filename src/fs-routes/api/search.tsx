import { Context } from "hono";
import { createRoute } from "hono-fsr";
import NavSearchResults from "../../components/app/NavSearchResults";
import { searchCreators } from "../../features/app/services";
import { searchBooks } from "../../features/api/services";

export const GET = createRoute(async (c: Context) => {
  const searchQuery = c.req.query("search");
  const isMobile = c.req.query("isMobile") === "true";

  if (!searchQuery || searchQuery.length < 3) {
    return c.html(
      <div id={isMobile ? "search-results-mobile" : "search-results"}></div>,
    );
  }

  const searchTerm = searchQuery?.trim().toLowerCase();
  const [bookResults, creatorResults] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
  ]);

  return c.html(
    <NavSearchResults
      isMobile={isMobile}
      creators={creatorResults ?? []}
      books={bookResults ?? []}
    />,
  );
});
