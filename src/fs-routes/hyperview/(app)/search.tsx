import { createRoute } from "hono-fsr";
import { searchCreators } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { searchBooks } from "../../../features/api/services";
import HVSearchResults from "../../../features/hyperview/components/SearchResults";
import { signInEmptyHintStyles } from "../../../features/hyperview/hyperviewCommonScreenStyles";

/** Element id for `replace-inner` — must not match any `<style id="…">` in the screen. */
const SEARCH_RESULTS_TARGET_ID = "search-results-host";

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
        <Form id="search-form">
          <TextField
            style="search-input"
            name="q"
            placeholder="Search books, tags, creators…"
          >
            <Behavior
              trigger="change"
              //   debounce="500"
              verb="post"
              action="replace-inner"
              target={SEARCH_RESULTS_TARGET_ID}
              href={`${baseUrl}/hyperview/search`}
            />
          </TextField>
        </Form>
        <View
          id={SEARCH_RESULTS_TARGET_ID}
          xmlns="https://hyperview.org/hyperview"
          style="search-results-stack"
        ></View>
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
        {/* <Text style="featured-empty-hint">Enter a search term.</Text> */}
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
    <Style
      id="search-input"
      borderWidth={1}
      borderColor="#e5e5e5"
      borderRadius={10}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={14}
      paddingRight={14}
      fontSize={15}
      backgroundColor="#ffffff"
      color="#111111"
      marginBottom={4}
    />
    <Style
      id="search-results-stack"
      flexDirection="column"
      flexGrow={1}
      marginTop={16}
    />
    <Style id="search-block" flexDirection="column" />
    <Style id="search-block-spaced" flexDirection="column" marginTop={20} />
    <Style
      id="search-section-label"
      fontSize={11}
      fontWeight="600"
      color="#666666"
      marginBottom={10}
      marginTop={4}
      textTransform="uppercase"
      letterSpacing={0.6}
    />
    <Style
      id="search-row"
      flexDirection="row"
      alignItems="center"
      paddingTop={12}
      paddingBottom={12}
      borderBottomWidth={1}
      borderBottomColor="#eeeeee"
    />
    <Style
      id="search-row-main"
      flex={1}
      flexDirection="column"
      marginLeft={12}
    />
    <Style
      id="search-row-title"
      fontSize={15}
      fontWeight="600"
      color="#111111"
      lineHeight={20}
    />
    <Style
      id="search-row-sub"
      fontSize={12}
      color="#666666"
      marginTop={4}
      textTransform="uppercase"
      letterSpacing={0.4}
      lineHeight={16}
    />
    <Style
      id="search-avatar"
      width={48}
      height={48}
      borderRadius={24}
      borderWidth={1}
      borderColor="#eeeeee"
      backgroundColor="#f0f0ee"
    />
    <Style
      id="search-avatar-placeholder"
      width={48}
      height={48}
      borderRadius={24}
      backgroundColor="#e8e7e4"
      borderWidth={1}
      borderColor="#eeeeee"
    />
    <Style
      id="search-book-thumb"
      width={48}
      height={48}
      borderRadius={6}
      borderWidth={1}
      borderColor="#eeeeee"
      backgroundColor="#f0f0ee"
    />
    <Style
      id="search-book-thumb-placeholder"
      width={48}
      height={48}
      borderRadius={6}
      backgroundColor="#e8e7e4"
      borderWidth={1}
      borderColor="#eeeeee"
    />
    <Style
      id="search-verified"
      fontSize={14}
      fontWeight="700"
      color="#2563eb"
    />
    <Style
      id="search-empty-hint"
      fontSize={14}
      color="#888888"
      lineHeight={22}
      paddingTop={24}
      paddingBottom={16}
      textAlign="center"
    />
    {signInEmptyHintStyles()}
  </>
);
