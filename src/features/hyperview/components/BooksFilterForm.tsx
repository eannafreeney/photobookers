import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";

/** Element id for `replace-inner` — must not match any `<style id="…">` in the screen. */
export const BOOKS_LIST_TARGET_ID = "books-list-host";

/** Element id for `toggle` / `replace` — must not match any `<style id="…">`. */
export const BOOKS_SEARCH_BAR_ID = "books-search-bar-area";

export const BOOKS_FILTER_Q_ID = "books-filter-q";

type Props = {
  baseUrl: string;
};

const BooksFilterForm = ({ baseUrl }: Props) => (
  <Form id="books-filter-form">
    <View style="books-filter-row">
      <TextField
        id={BOOKS_FILTER_Q_ID}
        style="books-filter-input"
        name="q"
        placeholder="Filter by title, artist, publisher, or tag…"
      >
        <Behavior
          trigger="change"
          delay={400}
          verb="post"
          action="replace"
          target={BOOKS_LIST_TARGET_ID}
          href={`${baseUrl}/hyperview/books`}
        />
      </TextField>
      <View style="books-filter-cancel">
        <Text style="books-filter-cancel-label">Cancel</Text>
        <Behavior action="set-value" target={BOOKS_FILTER_Q_ID} new-value="" />
        <Behavior
          delay={50}
          verb="post"
          action="replace"
          target={BOOKS_LIST_TARGET_ID}
          href={`${baseUrl}/hyperview/books`}
        />
      </View>
    </View>
  </Form>
);

export default BooksFilterForm;

export const booksFilterFormStyles = () => (
  <>
    <Style
      id="books-search-bar"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      backgroundColor="#fbfaf7"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="books-filter-row"
      flexDirection="row"
      alignItems="center"
      gap={8}
    />
    <Style
      id="books-filter-input"
      flex={1}
      borderWidth={1}
      borderColor="#e4e0d5"
      borderRadius={0}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={14}
      paddingRight={14}
      fontSize={15}
      backgroundColor="#fbfaf7"
      color="#191613"
    />
    <Style
      id="books-filter-cancel"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      flexShrink={0}
    />
    <Style
      id="books-filter-cancel-label"
      fontSize={15}
      fontWeight="600"
      color="#45413a"
    />
    <Style id="books-list-panel" flex={1} />
  </>
);
