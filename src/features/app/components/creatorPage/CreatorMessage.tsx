import Badge from "../../../../components/app/Badge";
import {
  Creator,
  CreatorMessage as CreatorMessageType,
} from "../../../../db/schema";
import PostLikeButton from "../../../collectors/components/PostLikeButton";

type CreatorMessageProps = {
  creator: Pick<Creator, "id" | "slug" | "displayName" | "coverUrl">;
  message: CreatorMessageType;
  canReadMessages?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
};

const CreatorMessage = ({
  creator,
  message,
  canReadMessages = true,
  likeCount = 0,
  likedByMe = false,
}: CreatorMessageProps) => {
  const redactClass = !canReadMessages
    ? "select-none blur-[3px] pointer-events-none"
    : "";

  return (
    <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
      <header class="mb-3 flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2">
          <a href={`/creators/${creator.slug}`} class="min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              <img
                src={creator.coverUrl ?? ""}
                alt={creator.displayName}
                class="size-8 rounded-full object-cover"
              />
              <span class="truncate text-sm font-medium text-on-surface-strong">
                {creator.displayName}
              </span>
            </div>
          </a>
          <Badge variant="accent">Creator</Badge>
        </div>
        <time class="shrink-0 text-xs text-on-surface">
          {message.createdAt
            ? new Date(message.createdAt).toLocaleDateString()
            : ""}
        </time>
      </header>
      <div class="relative">
        <div class={redactClass}>
          <p class="whitespace-pre-wrap text-sm text-on-surface">
            {message.body}
          </p>
          {message.imageUrl && (
            <div class="mt-3">
              <img
                src={message.imageUrl}
                alt="Post image"
                class="w-full rounded-radius object-cover border border-outline"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {!canReadMessages && (
          <div class="absolute inset-0 grid place-items-center">
            <div class="rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm">
              Follow to unlock
            </div>
          </div>
        )}
      </div>
      {canReadMessages ? (
        <PostLikeButton
          postId={message.id}
          likedByMe={likedByMe}
          likeCount={likeCount}
        />
      ) : null}
    </article>
  );
};

export default CreatorMessage;
