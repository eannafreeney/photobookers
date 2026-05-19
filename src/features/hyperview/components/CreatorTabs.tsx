import { Modifier, Option, SelectSingle, Style } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";

export type CreatorTab = "books" | "messages" | "publishers" | "about";

type CreatorTabsProps = {
  baseUrl: string;
  creatorId: string;
  creatorType: "artist" | "publisher";
  activeTab?: CreatorTab;
};

const CreatorTabs = ({
  baseUrl,
  creatorId,
  creatorType,
  activeTab = "books",
}: CreatorTabsProps) => {
  console.log(creatorType, "creatorType");
  return (
    <>
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="books"
          style="tab-btn"
          selected={activeTab === "books" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${creatorId}/tab/books-content`}
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
          href={`${baseUrl}/hyperview/creators/${creatorId}/tab/messages`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">Messages</Text>
        </Option>
        <Option
          value={creatorType === "publisher" ? "publishers" : "artists"}
          style="tab-btn"
          selected={
            activeTab ===
            (creatorType === "publisher" ? "publishers" : "artists")
              ? "true"
              : undefined
          }
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${creatorId}/tab/${creatorType === "publisher" ? "artists" : "publishers"}`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">
            {creatorType === "publisher" ? "Artists" : "Publishers"}
          </Text>
        </Option>
        <Option
          value="about"
          style="tab-btn"
          selected={activeTab === "about" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/creators/${creatorId}/tab/about`}
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
      paddingTop={5}
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
