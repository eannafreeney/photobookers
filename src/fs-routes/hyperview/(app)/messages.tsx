import { createRoute } from "hono-fsr";
import { getMessagesForFollower } from "../../../features/app/services";
import { AppLayout } from "../+layout";
import { hyperview } from "../../../lib/hxml";
import {
  messageListStyles,
  signInEmptyHintStyles,
} from "../../../features/hyperview/hyperviewCommonScreenStyles";
import { Style, Text, View } from "../../../lib/hxml-comps";
import { getBaseUrl } from "../../../lib/hyperview";
import { formatDate, getUser } from "../../../utils";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  if (!user) {
    return hv(
      <AppLayout
        title="Messages"
        showBackButton={false}
        showDock
        baseUrl={baseUrl}
        dockActive="messages"
        extraStyles={pageStyles()}
      >
        <View style="page-content">
          <Text style="featured-signin-hint">
            Sign in to see messages from creators you follow.
          </Text>
        </View>
      </AppLayout>,
    );
  }

  const [, msgResult] = await getMessagesForFollower(user.id, 1, 20);
  const messages = msgResult?.messages ?? [];

  return hv(
    <AppLayout
      title="Messages"
      showBackButton={false}
      showDock
      baseUrl={baseUrl}
      dockActive="messages"
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        {messages.length === 0 ? (
          <Text style="featured-empty-hint">
            No messages yet. Follow creators to see their updates here.
          </Text>
        ) : (
          messages.map((m) => {
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
          })
        )}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style id="page-content" marginRight={16} marginLeft={16} paddingBottom={8} />
    {signInEmptyHintStyles()}
    {messageListStyles()}
  </>
);
