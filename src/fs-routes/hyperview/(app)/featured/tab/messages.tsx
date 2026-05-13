import { createRoute } from "hono-fsr";
import { getMessagesForFollower } from "../../../../../features/app/services";
import { hyperview } from "../../../../../lib/hxml";
import { Text, View } from "../../../../../lib/hxml-comps";
import { formatDate, getUser } from "../../../../../utils";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);

  if (!user) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-signin-hint">
          Sign in to see messages from creators you follow.
        </Text>
      </view>,
    );
  }

  const [, msgResult] = await getMessagesForFollower(user.id, 1, 20);
  const messages = msgResult?.messages ?? [];

  if (messages.length === 0) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="featured-empty-hint">
          No messages yet. Follow creators to see their updates here.
        </Text>
      </view>,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      {messages.map((m) => {
        const preview =
          m.body.length > 160 ? `${m.body.slice(0, 157)}…` : m.body;
        return (
          <View key={m.id} style="message-row">
            <Text style="message-from">
              {m.creator?.displayName ?? "Creator"}
            </Text>
            {m.createdAt && (
              <Text style="message-date">{formatDate(m.createdAt)}</Text>
            )}
            <Text style="message-preview">{preview}</Text>
          </View>
        );
      })}
    </view>,
  );
});
