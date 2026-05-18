import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { searchCreators } from "../../features/app/services";
import { searchBooks } from "../../features/api/services";
import Link from "../../components/app/Link";
import { capitalize, getUser } from "../../utils";
import { DISCOVER_TAGS } from "../../constants/discover";
import Pill from "../../components/app/Pill";
import InfoPage from "../../pages/InfoPage";
import NavSearchResults from "../../components/app/NavSearchResults";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const isMobile = c.req.query("isMobile") === "true";

  if (!searchQuery || searchQuery.length < 3) {
    return c.html(
      <div
        id={isMobile ? "search-results-mobile" : "search-results"}
        class="fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11  md:h-auto md:w-fit md:min-w-64 lg:min-w-96 md:rounded-radius overflow-hidden rounded-radius border shadow-sm border-outline bg-surface-alt "
        x-data="{ isOpen: true }"
        x-show="isOpen"
      >
        <div class="flex flex-wrap items-center justify-center gap-6 p-4">
          {DISCOVER_TAGS.map((tag) => (
            <Link href={`/books/tags/${tag.toLowerCase()}`} key={tag}>
              <Pill variant="default" key={tag}>
                {capitalize(tag)}
              </Pill>
            </Link>
          ))}
        </div>
      </div>,
    );
  }

  const searchTerm = searchQuery?.trim().toLowerCase();
  const [[bookError, books], [creatorError, creators]] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
  ]);

  if (bookError || creatorError) {
    return c.html(<></>);
  }

  return c.html(
    <NavSearchResults
      isMobile={isMobile}
      creators={creators ?? []}
      books={books ?? []}
    />,
  );
});
