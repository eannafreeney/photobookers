import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";

export type CreatorsTab = "following" | "all" | "publishers" | "artists";

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
    <View style="creator-tabs-sticky">
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="all"
          style="tab-btn"
          selected={activeTab === "all" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "all")} />
          <Text style="tab-label">ALL</Text>
        </Option>
        <Option
          value="publishers"
          style="tab-btn"
          selected={activeTab === "publishers" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "publishers")} />
          <Text style="tab-label">PUBLISHERS</Text>
        </Option>
        <Option
          value="artists"
          style="tab-btn"
          selected={activeTab === "artists" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "artists")} />
          <Text style="tab-label">ARTISTS</Text>
        </Option>
        <Option
          value="following"
          style="tab-btn"
          selected={activeTab === "following" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "following")} />
          <Text style="tab-label">FOLLOWING</Text>
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
      backgroundColor="#fbfaf7"
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
      letterSpacing={1.5}
      color="#a39d90"
    >
      <Modifier selected="true">
        <Style color="#a22c29" />
      </Modifier>
    </Style>
  </>
);
