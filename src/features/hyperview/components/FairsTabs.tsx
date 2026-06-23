import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";

export type FairsTab = "upcoming" | "current" | "past";

export const FAIRS_TAB_TARGET_ID = "fairs-tab-area";

type Props = {
  baseUrl: string;
  activeTab?: FairsTab;
};

const tabLoadBehavior = (baseUrl: string, path: FairsTab) => ({
  trigger: "select" as const,
  verb: "get" as const,
  href: `${baseUrl}/hyperview/fairs/tab/${path}`,
  action: "replace-inner" as const,
  target: FAIRS_TAB_TARGET_ID,
  "hide-during-load": FAIRS_TAB_TARGET_ID,
  "show-during-load": "fairs-tab-spinner",
});

const FairsTabs = ({ baseUrl, activeTab = "current" }: Props) => (
  <View style="fairs-tabs-sticky">
    <SelectSingle style="tab-bar" name="tab">
      <Option
        value="upcoming"
        style="tab-btn"
        selected={activeTab === "upcoming" ? "true" : undefined}
      >
        <Behavior {...tabLoadBehavior(baseUrl, "upcoming")} />
        <Text style="tab-label">UPCOMING</Text>
      </Option>
      <Option
        value="current"
        style="tab-btn"
        selected={activeTab === "current" ? "true" : undefined}
      >
        <Behavior {...tabLoadBehavior(baseUrl, "current")} />
        <Text style="tab-label">HAPPENING NOW</Text>
      </Option>
      <Option
        value="past"
        style="tab-btn"
        selected={activeTab === "past" ? "true" : undefined}
      >
        <Behavior {...tabLoadBehavior(baseUrl, "past")} />
        <Text style="tab-label">PAST</Text>
      </Option>
    </SelectSingle>
  </View>
);

export default FairsTabs;

export const fairsTabStyles = () => (
  <>
    <Style
      id="fairs-tabs-sticky"
      backgroundColor="#fbfaf7"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="tab-bar"
      flexDirection="row"
      borderBottomWidth={1}
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="tab-btn"
      flex={1}
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    >
      <Modifier selected="true">
        <Style borderBottomWidth={2} borderBottomColor="#a22c29" />
      </Modifier>
    </Style>
    <Style
      id="tab-label"
      fontSize={10}
      fontWeight="600"
      letterSpacing={1}
      color="#a39d90"
    >
      <Modifier selected="true">
        <Style color="#a22c29" />
      </Modifier>
    </Style>
  </>
);
