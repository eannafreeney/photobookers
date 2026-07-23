import { createRoute } from "hono-fsr";
import NavSearchResults from "../../../components/app/NavSearchResults";
import PageHeader from "../../../components/app/PageHeader";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { searchBooks } from "../../../features/api/services";
import { searchFairsForNav } from "../../../features/app/fairs/services";
import { searchCreators } from "../../../features/app/services";
import { searchCollectors } from "../../../domain/collectors/services";
import { isFeatureEnabledForUser } from "../../../lib/features";
import { canonicalUrl, pageTitle } from "../../../lib/seo";
import { getUser } from "../../../utils";
import { ok } from "../../../lib/result";

const FULL_RESULTS_LIMIT = 50;

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const collectorsEnabled = isFeatureEnabledForUser("collectors", user);
  const searchQuery = c.req.query("search")?.trim() ?? "";
  const currentPath = searchQuery
    ? `/search/results?search=${encodeURIComponent(searchQuery)}`
    : "/search/results";
  const title = pageTitle(
    searchQuery ? `Search results for "${searchQuery}"` : "Search",
  );
  const description = searchQuery
    ? `Search photobookers for creators, books, and fairs matching "${searchQuery}".`
    : "Search photobookers for creators, books, and fairs.";

  if (searchQuery.length < 3) {
    return c.html(
      <AppLayout
        title={title}
        description={description}
        canonicalUrl={canonicalUrl(c.req.url, currentPath)}
        user={user}
        currentPath={currentPath}
      >
        <Page>
          <div class="flex flex-col gap-6">
            <PageHeader
              kicker="Search"
              title="Search results"
              intro="Enter at least 3 characters to search across creators, books, and fairs."
            />
            <SearchResultsForm searchQuery={searchQuery} />
          </div>
        </Page>
      </AppLayout>,
    );
  }

  const [
    [bookError, books],
    [creatorError, creators],
    [fairError, fairs],
    [collectorError, collectors],
  ] = await Promise.all([
    searchBooks(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT),
    searchCreators(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT),
    searchFairsForNav(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT),
    collectorsEnabled
      ? searchCollectors(searchQuery.toLowerCase(), FULL_RESULTS_LIMIT)
      : Promise.resolve(ok([])),
  ]);

  if (bookError || creatorError || fairError || collectorError) {
    return c.html(<></>);
  }

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, currentPath)}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <div class="flex flex-col gap-6">
          <PageHeader
            kicker="Search"
            title={
              <>
                Results for <span class="text-accent">"{searchQuery}"</span>
              </>
            }
            intro="Explore matching creators, books, and fairs from across photobookers."
          />
          <SearchResultsForm searchQuery={searchQuery} />
          <NavSearchResults
            creators={creators ?? []}
            books={books ?? []}
            fairs={fairs ?? []}
            collectors={collectorsEnabled ? (collectors ?? []) : []}
            searchQuery={searchQuery}
            variant="page"
          />
        </div>
      </Page>
    </AppLayout>,
  );
});

const SearchResultsForm = ({ searchQuery }: { searchQuery: string }) => (
  <form action="/search/results" method="get" class="w-full">
    <div class="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        name="search"
        value={searchQuery}
        placeholder="Search creators, books, and fairs"
        class="w-full rounded-radius border border-outline bg-surface px-4 py-3 text-base text-on-surface focus:outline-none"
      />
      <button
        type="submit"
        class="whitespace-nowrap rounded-radius bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-primary transition hover:opacity-75"
      >
        Search
      </button>
    </div>
  </form>
);
