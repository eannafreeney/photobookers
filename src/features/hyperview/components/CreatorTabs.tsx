import {
  Modifier,
  Option,
  SelectSingle,
  Style,
  View,
} from "../../../lib/hxml-comps";
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
  return (
    <View style="creator-tabs-sticky" sticky="true">
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
          <Text style="tab-label">BOOKS</Text>
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
          <Text style="tab-label">MESSAGES</Text>
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
            {creatorType === "publisher" ? "ARTISTS" : "PUBLISHERS"}
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
          <Text style="tab-label">ABOUT</Text>
        </Option>
      </SelectSingle>
    </View>
  );
};

export default CreatorTabs;

export const creatorTabStyles = () => (
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
      paddingTop={5}
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
