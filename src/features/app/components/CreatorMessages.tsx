import { AuthUser } from "../../../../types";
import { findFollow } from "../../../db/queries";
import { getMessagesByCreatorSlug } from "../services";
import CreatorMessage from "./CreatorMessage";
import ListNavigation from "./ListNavigation";

type CreatorMessagesProps = {
  creatorSlug: string;
  user: AuthUser | null;
};

const CreatorMessages = async ({ creatorSlug, user }: CreatorMessagesProps) => {
  const [error, result] = await getMessagesByCreatorSlug(creatorSlug, 1, 5);
  if (error || !result) return <></>;

  const { messages, totalPages, page, creator } = result;

  const isOwner = user?.creator?.id === creator.id;
  const isFollower = user?.id
    ? Boolean(await findFollow(creator.id, user.id)) || isOwner
    : false;

  const targetId = `creator-messages-${creator.id}`;

  return (
    <div id={targetId} class="w-full flex flex-col gap-4">
      {messages.length === 0 ? (
        <div class="rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          {isOwner ? (
            <>
              <p class="font-medium text-on-surface-strong">No posts yet</p>
              <p class="mt-2 text-pretty">
                Share fair dates, work-in-progress shots, or news with people
                who follow you.
              </p>
              <a
                href="/dashboard/messages"
                class="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                Write your first post →
              </a>
            </>
          ) : isFollower ? (
            <p>
              No posts yet. Check back soon for updates from{" "}
              {creator.displayName}.
            </p>
          ) : (
            <p>
              No posts yet. Follow {creator.displayName} to see updates here.
            </p>
          )}
        </div>
      ) : (
        messages.map((message, index) => (
          <CreatorMessage
            creator={creator}
            message={message}
            isFollower={isFollower}
            user={user}
            isFirst={index === 0}
          />
        ))
      )}
      <ListNavigation
        targetId={targetId}
        totalPages={totalPages}
        page={page}
        currentPath={`/creators/${creator.slug}`}
      />
    </div>
  );
};

export default CreatorMessages;
