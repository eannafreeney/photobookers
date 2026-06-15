import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils";
import MemberSignInPrompt, {
  memberSignInPrompts,
} from "../../features/app/components/MemberSignInPrompt";
import { getMessagesForFollower } from "../../features/app/services";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import InfoPage from "../../pages/InfoPage";
import CreatorMessage from "../../features/app/components/CreatorMessage";
import ListNavigation from "../../features/app/components/ListNavigation";

const MessagesHeader = () => (
  <div class="flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4">
    <span class="kicker text-accent">Your Messages</span>
    <h1 class="font-display text-3xl font-medium text-on-surface-strong">
      Updates from creators you follow
    </h1>
  </div>
);

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);

  if (!user) {
    return c.html(
      <AppLayout
        title="Updates"
        user={user}
        flash={flash}
        currentPath={currentPath}
        noIndex
      >
        <Page>
          <div class="mx-auto flex w-full max-w-[600px] flex-col gap-6">
            <MessagesHeader />
            <MemberSignInPrompt
              prompt={memberSignInPrompts.messages}
              currentPath={currentPath}
            />
          </div>
        </Page>
      </AppLayout>,
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
      noIndex
    >
      <Page>
        <div id={targetId} class="mx-auto flex w-full max-w-[600px] flex-col gap-4">
          <MessagesHeader />
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
