import { createRoute } from "hono-fsr";
import { getMessagesForFollower } from "../../../../../features/app/services";
import MessagesList from "../../../../../features/hyperview/components/MessagesList";
import { hyperview } from "../../../../../lib/hxml";
import { Text } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt";
import ErrorScreen from "../../../../../features/hyperview/components/ErrorScreen";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const user = await getUser(c);
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const loadMoreHref = `${baseUrl}/hyperview/featured/tab/messages`;

  if (!user) {
    return hv(
      <SignInPrompt
        variant="fragment"
        baseUrl={baseUrl}
        hint="Sign in to see messages from creators you follow."
      />,
    );
  }

  const [error, msgResult] = await getMessagesForFollower(
    user.id,
    currentPage,
    10,
  );

  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
    );
  }

  const messages = msgResult?.messages ?? [];
  const totalPages = msgResult?.totalPages ?? 1;
  const hasMore = currentPage < totalPages;

  if (currentPage === 1 && messages.length === 0) {
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
      <MessagesList
        messages={messages}
        page={currentPage}
        hasMore={hasMore}
        loadMoreHref={loadMoreHref}
      />
    </view>,
  );
});
