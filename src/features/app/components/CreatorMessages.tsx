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

  const isFollower = user?.id
    ? Boolean(await findFollow(creator.id, user.id)) ||
      user.creator?.id === creator.id
    : false;

  const targetId = `creator-messages-${creator.id}`;

  return (
    <div id={targetId} class="w-full flex flex-col gap-4">
      {messages.length === 0 ? (
        <div class="rounded-radius border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          No messages yet.
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
