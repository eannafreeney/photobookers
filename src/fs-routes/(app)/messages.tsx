import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils";
import LoggedOutScreen from "../../features/app/components/LoggedOutScreen";
import { getMessagesForFollower } from "../../features/app/services";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import InfoPage from "../../pages/InfoPage";
import CreatorMessage from "../../features/app/components/CreatorMessage";
import ListNavigation from "../../features/app/components/ListNavigation";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  if (!user) {
    return c.html(
      <LoggedOutScreen
        title="Updates"
        description="see updates from creators you follow"
        user={user}
        flash={flash}
        currentPath={currentPath}
      >
        {null}
      </LoggedOutScreen>,
    );
  }

  const [error, result] = await getMessagesForFollower(user.id, currentPage);

  if (error)
    return c.html(
      <InfoPage errorMessage="Failed to get messages for follower" />,
    );

  const { messages, totalPages, page } = result;
  const targetId = `messages-list`;

  return c.html(
    <AppLayout
      title="Updates"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <div id={targetId} class="flex flex-col gap-4 md:w-[600px] mx-auto">
          <h1 class="text-xl font-semibold">
            Updates from creators you follow
          </h1>
          {messages.length === 0 ? (
            <p class="text-on-surface">
              Messages from creators you follow will appear here.
            </p>
          ) : (
            messages.map((msg, index) => (
              <CreatorMessage
                user={user}
                isFollower
                creator={msg.creator}
                message={msg}
                isFirst={index === 0}
              />
            ))
          )}
          <ListNavigation
            isInfiniteScroll
            targetId={targetId}
            totalPages={totalPages}
            page={page}
            currentPath={currentPath}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});
