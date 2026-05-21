import { Spinner, Style, Text, View } from "../../../lib/hxml-comps";
import { formatDate } from "../../../utils";

export const FEATURED_MESSAGES_LOAD_MORE_ID = "featured-messages-load-more";

type MessageRow = {
  id: string;
  body: string;
  createdAt: Date | null;
  creator?: {
    displayName: string;
  } | null;
};

type Props = {
  messages: MessageRow[];
  page?: number;
  hasMore?: boolean;
  loadMoreHref?: string;
};

const MessagesList = ({
  messages,
  page = 1,
  hasMore = false,
  loadMoreHref,
}: Props) => (
  <>
    {messages.map((m) => {
      const preview =
        m.body.length > 160 ? `${m.body.slice(0, 157)}…` : m.body;
      return (
        <View key={m.id} style="message-row">
          <Text style="message-from">
            {m.creator?.displayName ?? "Creator"}
          </Text>
          {m.createdAt ? (
            <Text style="message-date">{formatDate(m.createdAt)}</Text>
          ) : null}
          <Text style="message-preview">{preview}</Text>
        </View>
      );
    })}
    {hasMore && loadMoreHref ? (
      <view
        id={FEATURED_MESSAGES_LOAD_MORE_ID}
        style="featured-tab-spinner"
        trigger="visible"
        once="true"
        verb="get"
        href={`${loadMoreHref}?page=${page + 1}`}
        action="replace"
      >
        <Spinner />
      </view>
    ) : null}
  </>
);

export default MessagesList;

export const messagesListStyles = () => (
  <>
    <Style
      id="featured-tab-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
