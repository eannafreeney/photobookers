import { AuthUser } from "../../../../../types";
import { Creator, CreatorMessage } from "../../../../db/schema";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../admin/components/Breadcrumbs";
import MessageForm from "../forms/MessageForm";

type Props = {
  user: AuthUser;
  creator: Creator;
  currentPath: string;
  messages: CreatorMessage[];
};

const MessagesListPage = ({ user, creator, currentPath, messages }: Props) => {
  return (
    <AppLayout title="Messages" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard/books" },
            {
              label: creator.displayName,
              href: `/dashboard/creators/${creator.id}/update`,
            },
            { label: "Messages" },
          ]}
        />
        <MessageForm creatorId={creator.id} />
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold">Messages to followers</h1>
            <a
              href={`/dashboard/creators/${creator.id}/messages/new`}
              class="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-content hover:opacity-90"
            >
              New message
            </a>
          </div>
          <p class="text-sm text-on-surface-weak">
            Only people who follow you can see these messages.
          </p>
          {messages.length === 0 ? (
            <p class="text-on-surface-weak">No messages yet.</p>
          ) : (
            <ul class="space-y-4">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  class="rounded-lg border border-outline bg-surface-alt p-4"
                >
                  <p class="whitespace-pre-wrap text-sm">{msg.body}</p>
                  {msg.imageUrls?.length ? (
                    <div class="mt-2 flex flex-wrap gap-2">
                      {msg.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt=""
                          class="max-h-32 rounded object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <p class="mt-2 text-xs text-on-surface-weak">
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

export default MessagesListPage;
