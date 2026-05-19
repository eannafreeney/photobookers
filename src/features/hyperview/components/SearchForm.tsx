import { SEARCH_RESULTS_TARGET_ID } from "../../../fs-routes/hyperview/(app)/search";
import { Behavior, Form, Style } from "../../../lib/hxml-comps";
import { TextField } from "../../../lib/hxml-comps";

const SearchForm = ({ baseUrl }: { baseUrl: string }) => {
  return (
    <Form id="search-form">
      <TextField
        style="search-input"
        name="q"
        placeholder="Search books, tags, creators…"
      >
        <Behavior
          trigger="change"
          delay={500}
          verb="post"
          action="replace-inner"
          target={SEARCH_RESULTS_TARGET_ID}
          href={`${baseUrl}/hyperview/search`}
        />
      </TextField>
    </Form>
  );
};

export default SearchForm;

export const searchFormStyles = () => (
  <>
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
  </>
);
