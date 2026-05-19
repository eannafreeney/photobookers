import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Text, View } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services";
import { creatorIdSchema } from "../../../../../../schemas";
import { getMessagesByCreator } from "../../../../../../features/dashboard/messages/services";
import { formatDate } from "../../../../../../utils";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);

  const hv = hyperview(c);

  const [error, result] = await getMessagesByCreator(creatorId);

  if (error || !result) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Messages not found.</Text>
      </view>,
      404,
    );
  }

  const { messages } = result;

  if (messages.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">No messages found.</Text>
      </view>,
      404,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {messages.map((message) => (
        <View key={message.id} style="message-row">
          <Text style="message-date">
            {formatDate(message.createdAt ?? new Date())}
          </Text>
          <Text style="message-preview">{message.body}</Text>
        </View>
      ))}
    </view>,
  );
});
