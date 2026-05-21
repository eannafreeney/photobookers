import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";

export type CreatorsTab = "following" | "all";

type CreatorsTabsProps = {
  baseUrl: string;
  activeTab?: CreatorsTab;
};

const tabLoadBehavior = (baseUrl: string, path: string) => ({
  trigger: "select" as const,
  verb: "get" as const,
  href: `${baseUrl}/hyperview/creators/tab/${path}`,
  action: "replace-inner" as const,
  target: "tab-area",
  "hide-during-load": "tab-area",
  "show-during-load": "tab-spinner",
});

const CreatorsTabs = ({
  baseUrl,
  activeTab = "following",
}: CreatorsTabsProps) => {
  return (
    <View style="creator-tabs-sticky" sticky="true">
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="all"
          style="tab-btn"
          selected={activeTab === "all" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "all")} />
          <Text style="tab-label">All</Text>
        </Option>
        <Option
          value="following"
          style="tab-btn"
          selected={activeTab === "following" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "following")} />
          <Text style="tab-label">Following</Text>
        </Option>
      </SelectSingle>
    </View>
  );
};

export default CreatorsTabs;

export const creatorsTabStyles = () => (
  <>
    <Style
      id="creator-tabs-sticky"
      backgroundColor="#f8f7f5"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
    />
    <Style
      id="tab-btn"
      flex={1}
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    >
      <Modifier selected="true">
        <Style borderBottomWidth={2} borderBottomColor="#0099cc" />
      </Modifier>
    </Style>
    <Style id="tab-label" fontSize={13} fontWeight="600" color="#999999">
      <Modifier selected="true">
        <Style color="#0099cc" />
      </Modifier>
    </Style>
  </>
);
