import { Behavior } from "../../../lib/hxml-comps";
import { View, Text } from "../../../lib/hxml-comps";

type BookTabsProps = {
  baseUrl: string;
  slug: string;
  hasPublisher: boolean;
};

const BookTabs = ({ baseUrl, slug, hasPublisher }: BookTabsProps) => {
  return (
    <View style="tab-bar">
      <View style="tab-btn">
        <Text style="tab-label">Book</Text>
        <Behavior
          trigger="press"
          action="replace-inner"
          href={`${baseUrl}/hyperview/books/${slug}/tab/book-content`}
          target="tab-area"
        />
      </View>
      <View style="tab-btn">
        <Text style="tab-label">Comments</Text>
        <Behavior
          trigger="press"
          action="replace-inner"
          href={`${baseUrl}/hyperview/books/${slug}/tab/comments`}
          target="tab-area"
        />
      </View>
      <View style="tab-btn">
        <Text style="tab-label">Artist</Text>
        <Behavior
          trigger="press"
          action="replace-inner"
          href={`${baseUrl}/hyperview/books/${slug}/tab/artist`}
          target="tab-area"
        />
      </View>
      {hasPublisher && (
        <View style="tab-btn">
          <Text style="tab-label">Publisher</Text>
          <Behavior
            trigger="press"
            action="replace-inner"
            href={`${baseUrl}/hyperview/books/${slug}/tab/publisher`}
            target="tab-area"
          />
        </View>
      )}
    </View>
  );
};

export default BookTabs;
