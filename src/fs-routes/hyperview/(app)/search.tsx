import { createRoute } from "hono-fsr";
import { searchCreators } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { searchBooks } from "../../../features/api/services";
import HVSearchResults, {
  hvSearchResultsStyles,
} from "../../../features/hyperview/components/SearchResults";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";
import DiscoveryTags, {
  discoveryTagStyles,
} from "../../../features/hyperview/components/DiscoveryTags";
import SearchForm, {
  searchFormStyles,
} from "../../../features/hyperview/components/SearchForm";
import { DISCOVER_TAGS } from "../../../constants/discover";

/** Element id for `replace-inner` — must not match any `<style id="…">` in the screen. */
export const SEARCH_RESULTS_TARGET_ID = "search-results-host";

export const GET = createRoute(async (c) => {
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);

  return hv(
    <AppLayout
      title="Search"
      showDock
      baseUrl={baseUrl}
      dockActive="search"
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        <View style="search-section">
          <SearchForm baseUrl={baseUrl} />
        </View>
        <View
          id={SEARCH_RESULTS_TARGET_ID}
          xmlns="https://hyperview.org/hyperview"
          style="search-results-stack"
        >
          <DiscoveryTags baseUrl={baseUrl} tags={DISCOVER_TAGS} />
        </View>
      </View>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);

  const form = await c.req.formData();
  const searchTerm = String(form.get("q") ?? "").trim();

  if (!searchTerm || searchTerm.length < 3) {
    return hv(
      <View
        xmlns="https://hyperview.org/hyperview"
        style="search-results-stack"
      >
        <DiscoveryTags baseUrl={baseUrl} tags={DISCOVER_TAGS} />
      </View>,
    );
  }

  const [[bookError, books], [creatorError, creators]] = await Promise.all([
    searchBooks(searchTerm ?? ""),
    searchCreators(searchTerm ?? ""),
  ]);

  if (bookError || creatorError) {
    return hv(
      <View
        xmlns="https://hyperview.org/hyperview"
        style="search-results-stack"
      >
        <Text style="featured-empty-hint">Search failed. Try again.</Text>
      </View>,
    );
  }

  return hv(
    <HVSearchResults books={books} creators={creators} baseUrl={baseUrl} />,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="page-content"
      marginRight={16}
      marginLeft={16}
      paddingTop={4}
      paddingBottom={16}
    />

    {signInEmptyHintStyles()}
    {discoveryTagStyles()}
    {searchFormStyles()}
    {hvSearchResultsStyles()}
  </>
);
