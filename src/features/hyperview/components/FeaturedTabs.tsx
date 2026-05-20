import { Behavior, Option, SelectSingle, Text } from "../../../lib/hxml-comps";

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
  target: "tab-area",
  "hide-during-load": "tab-area",
  "show-during-load": "tab-spinner",
});

const FeaturedTabs = ({ baseUrl, activeTab = "home" }: FeaturedTabsProps) => {
  return (
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
  );
};

export default FeaturedTabs;
