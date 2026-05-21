import {
  Behavior,
  Modifier,
  Option,
  SelectSingle,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";

import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_SPINNER_ID,
} from "./featuredTabIds";

export type FeaturedTab = "home" | "feed" | "messages";

type FeaturedTabsProps = {
  baseUrl: string;
  activeTab?: FeaturedTab;
};

const tabLoadBehavior = (baseUrl: string, path: string) => ({
  trigger: "select" as const,
  verb: "get" as const,
  href: `${baseUrl}/hyperview/featured/tab/${path}`,
  action: "replace-inner" as const,
  target: FEATURED_TAB_BODY_ID,
  "hide-during-load": FEATURED_TAB_BODY_ID,
  "show-during-load": FEATURED_TAB_SPINNER_ID,
});

const FeaturedTabs = ({ baseUrl, activeTab = "home" }: FeaturedTabsProps) => {
  return (
    <View style="featured-tabs-sticky" sticky="true">
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="home"
          style="tab-btn"
          selected={activeTab === "home" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "home-content")} />
          <Text style="tab-label">Home</Text>
        </Option>
        <Option
          value="feed"
          style="tab-btn"
          selected={activeTab === "feed" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "feed")} />
          <Text style="tab-label">Feed</Text>
        </Option>
        <Option
          value="messages"
          style="tab-btn"
          selected={activeTab === "messages" ? "true" : undefined}
        >
          <Behavior {...tabLoadBehavior(baseUrl, "messages")} />
          <Text style="tab-label">Messages</Text>
        </Option>
      </SelectSingle>
    </View>
  );
};

export default FeaturedTabs;

export const featuredTabStyles = () => (
  <>
    <Style
      id="featured-tabs-sticky"
      backgroundColor="#f8f7f5"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
    />
    <Style
      id="featured-tab-panel"
      flex={1}
      position="relative"
      minHeight={480}
      margin={16}
    />
    <Style
      id="featured-tab-spinner"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      alignItems="center"
      justifyContent="center"
    />
    <Style id="featured-tab-body" flex={1} />
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
