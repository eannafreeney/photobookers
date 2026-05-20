import { Option, SelectSingle } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";

export type FeaturedTab = "home" | "feed" | "messages";

type FeaturedTabsProps = {
  baseUrl: string;
  activeTab?: FeaturedTab;
};

const FeaturedTabs = ({ baseUrl, activeTab = "home" }: FeaturedTabsProps) => {
  return (
    <SelectSingle style="tab-bar" name="tab">
      <Option
        value="home"
        style="tab-btn"
        selected={activeTab === "home" ? "true" : undefined}
        trigger="select"
        href={`${baseUrl}/hyperview/featured/tab/home-content`}
        action="replace-inner"
        target="tab-area"
        hide-during-load="tab-area"
        show-during-load="tab-spinner"
      >
        <Text style="tab-label">Home</Text>
      </Option>
      <Option
        value="feed"
        style="tab-btn"
        selected={activeTab === "feed" ? "true" : undefined}
        trigger="select"
        href={`${baseUrl}/hyperview/featured/tab/feed`}
        action="replace-inner"
        target="tab-area"
        hide-during-load="tab-area"
        show-during-load="tab-spinner"
      >
        <Text style="tab-label">Feed</Text>
      </Option>
      <Option
        value="messages"
        style="tab-btn"
        selected={activeTab === "messages" ? "true" : undefined}
        trigger="select"
        href={`${baseUrl}/hyperview/featured/tab/messages`}
        action="replace-inner"
        target="tab-area"
        hide-during-load="tab-area"
        show-during-load="tab-spinner"
      >
        <Text style="tab-label">Messages</Text>
      </Option>
    </SelectSingle>
  );
};

export default FeaturedTabs;
