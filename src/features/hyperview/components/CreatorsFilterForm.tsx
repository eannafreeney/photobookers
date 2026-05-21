import { Behavior, Form, Style, TextField } from "../../../lib/hxml-comps";

export const CREATORS_TAB_TARGET_ID = "tab-area";

/** Element id for `toggle` — must not match any `<style id="…">`. */
export const CREATORS_SEARCH_BAR_ID = "creators-search-bar-area";

type Props = {
  baseUrl: string;
};

const CreatorsFilterForm = ({ baseUrl }: Props) => (
  <Form id="creators-filter-form">
    <TextField
      style="search-input"
      name="q"
      placeholder="Filter by creator name…"
    >
      <Behavior
        trigger="change"
        delay={400}
        verb="post"
        action="replace"
        target={CREATORS_TAB_TARGET_ID}
        href={`${baseUrl}/hyperview/creators`}
      />
    </TextField>
  </Form>
);

export default CreatorsFilterForm;

export const creatorsFilterFormStyles = () => (
  <>
    <Style
      id="creators-search-bar"
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
  </>
);
