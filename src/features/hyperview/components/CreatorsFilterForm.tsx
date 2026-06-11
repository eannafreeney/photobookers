import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";

export const CREATORS_TAB_TARGET_ID = "tab-area";

/** Element id for `toggle` — must not match any `<style id="…">`. */
export const CREATORS_SEARCH_BAR_ID = "creators-search-bar-area";
export const CREATORS_FILTER_Q_ID = "creators-filter-q";

type Props = {
  baseUrl: string;
};

const CreatorsFilterForm = ({ baseUrl }: Props) => (
  <Form id="creators-filter-form">
    <View style="creators-filter-row">
      <TextField
        id={CREATORS_FILTER_Q_ID}
        style="creators-filter-input"
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
      <View style="creators-filter-cancel">
        <Text style="creators-filter-cancel-label">Cancel</Text>
        <Behavior
          action="set-value"
          target={CREATORS_FILTER_Q_ID}
          new-value=""
        />
        <Behavior
          delay={50}
          verb="post"
          action="replace"
          target={CREATORS_TAB_TARGET_ID}
          href={`${baseUrl}/hyperview/creators`}
        />
      </View>
    </View>
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
      backgroundColor="#fbfaf7"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="creators-filter-row"
      flexDirection="row"
      alignItems="center"
      gap={8}
    />
    <Style
      id="creators-filter-input"
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
      id="creators-filter-cancel"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      flexShrink={0}
    />
    <Style
      id="creators-filter-cancel-label"
      fontSize={15}
      fontWeight="600"
      color="#45413a"
    />
  </>
);
