import { Modifier, Option, SelectSingle, Style } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";

export type CreatorTab = "books" | "messages" | "publishers" | "about";

type CreatorTabsProps = {
  baseUrl: string;
  slug: string;
  activeTab?: CreatorTab;
};

const CreatorTabs = ({
  baseUrl,
  slug,
  activeTab = "books",
}: CreatorTabsProps) => {
  return (
    <>
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="books"
          style="tab-btn"
          selected={activeTab === "books" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${slug}/tab/books-content`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">Books</Text>
        </Option>
        <Option
          value="messages"
          style="tab-btn"
          selected={activeTab === "messages" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${slug}/tab/messages`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">Messages</Text>
        </Option>
        <Option
          value="publishers"
          style="tab-btn"
          selected={activeTab === "publishers" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${slug}/tab/publishers`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">Publishers</Text>
        </Option>
        <Option
          value="about"
          style="tab-btn"
          selected={activeTab === "about" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${slug}/tab/about`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">About</Text>
        </Option>
      </SelectSingle>
    </>
  );
};

export default CreatorTabs;

export const creatorTabStyles = () => (
  <>
    <Style
      id="tab-btn"
      flex={1}
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
    >
      <Modifier selected="true">
        <Style borderBottomWidth={2} borderBottomColor="#111111" />
      </Modifier>
    </Style>
    <Style id="tab-label" fontSize={13} fontWeight="600" color="#999999">
      <Modifier selected="true">
        <Style color="#111111" />
      </Modifier>
    </Style>
  </>
);
