import {
  Modifier,
  Option,
  SelectSingle,
  Style,
  Spinner,
  View,
} from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";

export type BookTab = "book" | "comments" | "artist" | "publisher";

type BookTabsProps = {
  baseUrl: string;
  bookId: string;
  hasPublisher: boolean;
  activeTab?: BookTab;
};

const BookTabs = ({
  baseUrl,
  bookId,
  hasPublisher,
  activeTab = "book",
}: BookTabsProps) => {
  return (
    <View style="book-tabs-sticky" sticky="true">
      <SelectSingle style="tab-bar" name="tab">
        <Option
          value="book"
          style="tab-btn"
          selected={activeTab === "book" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/books/${bookId}/tab/book-content`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">BOOK</Text>
        </Option>
        <Option
          value="comments"
          style="tab-btn"
          selected={activeTab === "comments" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/books/${bookId}/tab/comments`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">COMMENTS</Text>
        </Option>
        <Option
          value="artist"
          style="tab-btn"
          selected={activeTab === "artist" ? "true" : undefined}
          trigger="select"
          href={`${baseUrl}/hyperview/books/${bookId}/tab/artist`}
          action="replace-inner"
          target="tab-area"
          hide-during-load="tab-area"
          show-during-load="tab-spinner"
        >
          <Text style="tab-label">ARTIST</Text>
        </Option>
        {hasPublisher && (
          <Option
            value="publisher"
            style="tab-btn"
            selected={activeTab === "publisher" ? "true" : undefined}
            trigger="select"
            href={`${baseUrl}/hyperview/books/${bookId}/tab/publisher`}
            action="replace-inner"
            target="tab-area"
            hide-during-load="tab-area"
            show-during-load="tab-spinner"
          >
            <Text style="tab-label">PUBLISHER</Text>
          </Option>
        )}
      </SelectSingle>
    </View>
  );
};

export default BookTabs;

export const bookTabStyles = () => (
  <>
    <Style
      id="book-tabs-sticky"
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
    <Style
      id="tab-spinner"
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingTop={40}
    />
  </>
);
