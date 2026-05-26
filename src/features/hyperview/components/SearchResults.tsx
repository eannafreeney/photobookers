import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";

/** Aligns with `NavSearchResults` / `searchCreators` columns. */
export type HyperviewCreatorSearchRow = {
  id: string;
  slug: string;
  displayName: string;
  coverUrl: string | null;
  status: string | null;
  type: string;
};

/** Aligns with `NavSearchResults` / `searchBooks` shape. */
export type HyperviewBookSearchRow = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  artist: { id: string; displayName: string } | null;
  publisher: { id: string; displayName: string } | null;
};

type Props = {
  books: HyperviewBookSearchRow[];
  creators: HyperviewCreatorSearchRow[];
  baseUrl: string;
};

const HVSearchResults: FC<Props> = ({ books, creators, baseUrl }) => {
  const hasResults = books.length > 0 || creators.length > 0;

  if (!hasResults) {
    return (
      <View
        xmlns="https://hyperview.org/hyperview"
        style="search-results-stack"
      >
        <Text style="featured-empty-hint">No results found</Text>
      </View>
    );
  }

  return (
    <View xmlns="https://hyperview.org/hyperview" style="search-results-stack">
      {creators.length > 0 ? (
        <View style="search-block">
          <Text style="search-section-label">Creators</Text>
          {creators.map((c) => (
            <View key={c.id} style="search-row">
              <Behavior
                href={`${baseUrl}/hyperview/creators/${c.id}/tab/books`}
              />
              {c.coverUrl ? (
                <Image
                  source={c.coverUrl}
                  style="search-avatar"
                  resize-mode="cover"
                />
              ) : (
                <View style="search-avatar-placeholder" />
              )}
              <View style="search-row-main">
                <Text style="search-row-title">{c.displayName}</Text>
                <Text style="search-row-sub">{c.type}</Text>
              </View>
              {c.status === "verified" ? (
                <Text style="search-verified">✓</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {books.length > 0 ? (
        <View
          style={creators.length > 0 ? "search-block-spaced" : "search-block"}
        >
          <Text style="search-section-label">Books</Text>
          {books.map((b) => (
            <View key={b.id} style="search-row">
              <Behavior href={`${baseUrl}/hyperview/books/${b.id}/tab/book`} />
              {b.coverUrl ? (
                <Image
                  source={b.coverUrl}
                  style="search-book-thumb"
                  resize-mode="cover"
                />
              ) : (
                <View style="search-book-thumb-placeholder" />
              )}
              <View style="search-row-main">
                <Text style="search-row-title">{b.title}</Text>
                {b.artist ? (
                  <Text style="search-row-sub">
                    {b.artist.displayName}
                    {b.publisher?.displayName
                      ? ` — ${b.publisher.displayName}`
                      : ""}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default HVSearchResults;

export const hvSearchResultsStyles = () => (
  <>
    <Style id="search-results-host" marginTop="4" />
    <Style id="search-results-stack" flexDirection="column" />
    <Style id="search-block" flexDirection="column" />
    <Style id="search-block-spaced" flexDirection="column" marginTop={16} />
    <Style
      id="search-section-label"
      fontSize={11}
      fontWeight="600"
      color="#666666"
      marginBottom={8}
    />
    <Style
      id="search-row"
      flexDirection="row"
      alignItems="center"
      paddingTop={10}
      paddingBottom={10}
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
    />
    <Style
      id="search-row-sub"
      fontSize={12}
      color="#666666"
      marginTop={2}
      textTransform="uppercase"
    />
    <Style id="search-avatar" width={48} height={48} borderRadius={24} />
    <Style
      id="search-avatar-placeholder"
      width={48}
      height={48}
      borderRadius={24}
      backgroundColor="#e5e5e5"
    />
    <Style id="search-book-thumb" width={48} height={48} borderRadius={4} />
    <Style
      id="search-book-thumb-placeholder"
      width={48}
      height={48}
      borderRadius={4}
      backgroundColor="#e5e5e5"
    />
    <Style
      id="search-verified"
      fontSize={14}
      fontWeight="700"
      color="#2563eb"
    />
  </>
);
