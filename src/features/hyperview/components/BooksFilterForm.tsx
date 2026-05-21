import { Behavior, Form, Style, TextField } from "../../../lib/hxml-comps";

/** Element id for `replace-inner` — must not match any `<style id="…">` in the screen. */
export const BOOKS_LIST_TARGET_ID = "books-list-host";

/** Element id for `toggle` / `replace` — must not match any `<style id="…">`. */
export const BOOKS_SEARCH_BAR_ID = "books-search-bar-area";

type Props = {
  baseUrl: string;
};

const BooksFilterForm = ({ baseUrl }: Props) => (
  <Form id="books-filter-form">
    <TextField
      style="search-input"
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
      backgroundColor="#ffffff"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
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
    />
    <Style id="books-list-panel" flex={1} />
  </>
);
