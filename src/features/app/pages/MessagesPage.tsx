import { AuthUser, Flash } from "../../../../types";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import NavTabs from "../../../components/layouts/NavTabs";
import { getMessagesForFollower } from "../services";
import LoggedOutScreen from "../components/LoggedOutScreen";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  currentPage: number;
};

const MessagesFeedPage = async ({
  user,
  flash,
  currentPath,
  currentPage,
}: Props) => {
  if (!user) {
    return (
      <LoggedOutScreen
        title="Updates"
        description="see updates from creators you follow"
        user={user}
        flash={flash}
        currentPath={currentPath}
      >
        {null}
      </LoggedOutScreen>
    );
  }

  const result = await getMessagesForFollower(user.id, currentPage);

  return (
    <AppLayout
      title="Updates"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <NavTabs currentPath={currentPath} />
        <div class="flex flex-col gap-6">
          <h1 class="text-xl font-semibold">
            Updates from creators you follow
          </h1>
          {result.messages.length === 0 ? (
            <p class="text-on-surface">
              Follow artists or publishers to see their messages here.
            </p>
          ) : (
            <ul class="space-y-6">
              {result.messages.map((msg) => (
                <li
                  key={msg.id}
                  class="rounded-lg border border-outline bg-surface-alt p-4"
                >
                  <a
                    href={`/creators/${msg.creator.slug}`}
                    class="text-sm font-medium text-primary hover:underline"
                  >
                    {msg.creator.displayName}
                  </a>
                  <p class="mt-2 whitespace-pre-wrap text-sm">{msg.body}</p>
                  {msg.imageUrls?.length ? (
                    <div class="mt-2 flex flex-wrap gap-2">
                      {msg.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt=""
                          class="max-h-48 rounded object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <p class="mt-2 text-xs text-on-surface">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleString()
                      : "—"}{" "}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Page>
    </AppLayout>
  );
};

export default MessagesFeedPage;
